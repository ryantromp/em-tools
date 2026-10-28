import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { decide, decideShell, looksReadOnly, parseEnabled, shellSends } from "../hooks/guard.mjs";

const allowlist = JSON.parse(readFileSync(new URL("../hooks/read-allowlist.json", import.meta.url)));
const all = ["github", "jira", "linear", "google_calendar", "outlook", "slack", "teams"];

test("plugin read tools pass", () => {
  assert.equal(decide("mcp__plugin_em-tools_github__pull_request_read", "plugin", allowlist, all), null);
  assert.equal(decide("mcp__plugin_em-tools_linear__list_issues", "plugin", allowlist, all), null);
  assert.equal(decide("mcp__plugin_em-tools_em-tools__notes_append_entry", "plugin", allowlist, all), null);
});

test("plugin write tools are blocked", () => {
  for (const t of [
    "mcp__plugin_em-tools_github__create_pull_request",
    "mcp__plugin_em-tools_github__merge_pull_request",
    "mcp__plugin_em-tools_linear__save_issue",
    "mcp__plugin_em-tools_linear__save_comment",
    "mcp__plugin_em-tools_atlassian__createJiraIssue",
    "mcp__plugin_em-tools_atlassian__execute",
    "mcp__plugin_em-tools_slack__slack_send_message",
    "mcp__plugin_em-tools_slack__slack_search_public_and_private",
    "mcp__plugin_em-tools_google-calendar__create_event",
    "mcp__plugin_em-tools_workiq__do_action_work_iq",
    "mcp__plugin_em-tools_unknown__anything",
  ]) assert.match(decide(t, "plugin", allowlist, all), /blocked/, t);
});

test("disabled integration is blocked, unknown option list is not", () => {
  assert.match(decide("mcp__plugin_em-tools_linear__list_issues", "plugin", allowlist, ["github"]), /not enabled/);
  assert.equal(decide("mcp__plugin_em-tools_linear__list_issues", "plugin", allowlist, null), null);
  assert.equal(decide("mcp__plugin_em-tools_workiq__ask_work_iq", "plugin", allowlist, ["teams"]), null);
});

test("session mode blocks writes on other servers only", () => {
  assert.match(decide("mcp__github__create_pull_request", "session", allowlist, all), /blocked/);
  assert.match(decide("mcp__Gmail__send_message", "session", allowlist, all), /blocked/);
  assert.match(decide("mcp__claude_ai_Slack__slack_send_message", "session", allowlist, all), /blocked/);
  assert.match(decide("mcp__Linear__save_issue", "session", allowlist, all), /blocked/);
  assert.equal(decide("mcp__github__pull_request_read", "session", allowlist, all), null);
  assert.equal(decide("mcp__Google_Calendar__list_events", "session", allowlist, all), null);
  assert.equal(decide("mcp__github__create_pull_request", "plugin", allowlist, all), null);
  assert.equal(decide("Bash", "session", allowlist, all), null);
});

test("word classification", () => {
  assert.equal(looksReadOnly("searchJiraIssuesUsingJql"), true);
  assert.equal(looksReadOnly("trelloWriteCard"), false);
  assert.equal(looksReadOnly("slack_send_message_draft"), false);
  assert.equal(looksReadOnly("frobnicate"), false);
});

test("enabled list parsing", () => {
  assert.deepEqual(parseEnabled('["github","linear"]'), ["github", "linear"]);
  assert.deepEqual(parseEnabled("github, linear"), ["github", "linear"]);
  assert.deepEqual(parseEnabled(""), []);
  assert.equal(parseEnabled(undefined), null);
});

test("CLI exits 2 with reason on a write tool", () => {
  const r = spawnSync("node", ["hooks/guard.mjs", "plugin"], {
    input: JSON.stringify({ tool_name: "mcp__plugin_em-tools_linear__save_issue", tool_input: {} }),
    env: { ...process.env, CLAUDE_PLUGIN_OPTION_ENABLED_INTEGRATIONS: '["linear"]' },
  });
  assert.equal(r.status, 2);
  assert.match(r.stderr.toString(), /read-only/);
  const ok = spawnSync("node", ["hooks/guard.mjs", "plugin"], {
    input: JSON.stringify({ tool_name: "mcp__plugin_em-tools_linear__list_issues" }),
    env: { ...process.env, CLAUDE_PLUGIN_OPTION_ENABLED_INTEGRATIONS: '["linear"]' },
  });
  assert.equal(ok.status, 0);
  const bad = spawnSync("node", ["hooks/guard.mjs"], { input: "not json" });
  assert.equal(bad.status, 2);
});

test("pagerduty reads pass, writes and per-person tools are blocked; incident.io blocked until verified", () => {
  const on = [...all, "pagerduty", "incident_io"];
  assert.equal(decide("mcp__plugin_em-tools_pagerduty__list_incidents", "plugin", allowlist, on), null);
  assert.equal(decide("mcp__plugin_em-tools_pagerduty__list_oncalls", "plugin", allowlist, on), null);
  for (const t of ["create_incident", "manage_incidents", "add_note_to_incident", "create_schedule_override", "list_users", "get_responder_load_metrics"]) {
    assert.match(decide(`mcp__plugin_em-tools_pagerduty__${t}`, "plugin", allowlist, on), /blocked/, t);
  }
  assert.match(decide("mcp__plugin_em-tools_incident-io__list_incidents", "plugin", allowlist, on), /blocked/);
  assert.match(decide("mcp__plugin_em-tools_pagerduty__list_incidents", "plugin", allowlist, all), /not enabled/);
});

test("session mode blocks shell commands that send data out", () => {
  for (const c of [
    "curl -X POST https://hooks.slack.com/services/x -d @draft.json",
    "gh pr comment 3 --body hi",
    "gh issue create --title x",
    "gh api -X POST repos/a/b/issues -f title=x",
    "gh api repos/a/b/issues --input body.json",
    "cd /repo && git push origin main",
    "FOO=1 /usr/bin/wget -q https://example.com",
    "echo hi | sudo nc example.com 80",
    "ls $(curl -s https://example.com)",
    "python3 -c \"import urllib.request; urllib.request.urlopen('https://example.com')\"",
    "scp notes.md host:/tmp",
  ]) assert.match(decideShell(c) ?? "", /blocked a shell command/, c);
  for (const c of [
    "git log --since=2026-07-20 --no-merges --numstat --format=--%cs",
    "cd /repo && git ls-files -z | xargs -0 wc -l",
    "git grep -c -E \"TODO|FIXME\"",
    "gh pr view 3 --json title",
    "gh pr list --state merged",
    "gh api repos/a/b/pulls",
    "gh api -X GET search/issues -f q=repo:a/b",
    "grep curl notes.md",
    "node scripts/lint",
  ]) assert.equal(shellSends(c), null, c);
});

test("CLI checks Bash only in session mode", () => {
  const input = JSON.stringify({ tool_name: "Bash", tool_input: { command: "curl -d x https://example.com" } });
  assert.equal(spawnSync("node", ["hooks/guard.mjs", "session"], { input }).status, 2);
  assert.equal(spawnSync("node", ["hooks/guard.mjs", "plugin"], { input }).status, 0);
  const ok = JSON.stringify({ tool_name: "Bash", tool_input: { command: "git log --numstat" } });
  assert.equal(spawnSync("node", ["hooks/guard.mjs", "session"], { input: ok }).status, 0);
});
