#!/usr/bin/env node
// Runs each skill headless against the fixtures with zero integrations and saves the
// output to examples/. Needs the `claude` CLI signed in.
//
// Usage: node scripts/run-examples.mjs [work-dir] [example-name ...]
// The work dir holds throwaway copies of the fixture notes folders, so fixtures stay clean.

import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WORK = resolve(process.argv[2] ?? join(tmpdir(), "em-tools-examples"));
const ONLY = process.argv.slice(3);
const F = join(REPO, "fixtures");
const TODAY = "2026-10-19";

const common = `Today is ${TODAY}. No integrations are enabled, so work only from the em-tools notes tools and the local export files named here. Do not save drafts or write to the notes; print the full output in markdown and nothing else.`;

const EXAMPLES = [
  {
    name: "one-on-one/eng-a3-prep",
    team: "team-a",
    prompt: `/em-tools:one-on-one A3 prep. ${common} Calendar: ${F}/calendar/team-a-google.csv. PRs: ${F}/github/team-a-prs.csv. Reviews: ${F}/github/team-a-reviews.csv. Tickets: ${F}/linear/team-a-issues.csv.`,
  },
  {
    name: "one-on-one/team-b-overdue",
    team: "team-b",
    prompt: `/em-tools:one-on-one overdue. Which of my 1:1s are missed, overdue or not booked? ${common} Calendar: ${F}/calendar/team-b-outlook.csv.`,
  },
  {
    name: "review-packet/eng-a1-promo-e5",
    team: "team-a",
    prompt: `/em-tools:review-packet A1 promo E5, period 2026-04-20 to 2026-10-16. ${common} PRs: ${F}/github/team-a-prs.csv. Reviews given: ${F}/github/team-a-reviews.csv. Incidents: ${F}/incidents/team-a-incidents.csv. Tickets: ${F}/linear/team-a-issues.csv. Public channel export: ${F}/slack/team-a-messages.json.`,
  },
  {
    name: "review-packet/eng-a3-review",
    team: "team-a",
    prompt: `/em-tools:review-packet A3 review, period 2026-04-20 to 2026-10-16. Also check this draft sentence of mine for bias: "A3 is a nice guy but needs to step up and seems to lack polish. He never asks for help." ${common} PRs: ${F}/github/team-a-prs.csv. Reviews given: ${F}/github/team-a-reviews.csv. Incidents: ${F}/incidents/team-a-incidents.csv. Tickets: ${F}/linear/team-a-issues.csv.`,
  },
  {
    name: "upward-update/team-a-2026-10-16",
    team: "team-a",
    prompt: `/em-tools:upward-update week ending 2026-10-16, both versions. ${common} Tickets: ${F}/linear/team-a-issues.csv. PRs: ${F}/github/team-a-prs.csv. Deployments: ${F}/github/team-a-deployments.csv. Incidents: ${F}/incidents/team-a-incidents.csv. Public Slack channel export: ${F}/slack/team-a-messages.json. Last week's update is in the notes folder drafts.`,
  },
  {
    name: "upward-update/team-b-2026-10-16",
    team: "team-b",
    prompt: `/em-tools:upward-update week ending 2026-10-16, both versions. ${common} Tickets (Jira export): ${F}/jira/team-b-issues.csv. PRs: ${F}/github/team-b-prs.csv. Releases: ${F}/github/team-b-deployments.csv. Public Teams channel export: ${F}/teams/team-b-messages.json.`,
  },
  {
    name: "team-delivery-health/team-a-12-weeks",
    team: "team-a",
    prompt: `/em-tools:team-delivery-health 12 weeks: window 2026-07-27 to 2026-10-16, comparison 2026-05-04 to 2026-07-24. ${common} PRs: ${F}/github/team-a-prs.csv. Deployments: ${F}/github/team-a-deployments.csv. Incidents: ${F}/incidents/team-a-incidents.csv. Calendar: ${F}/calendar/team-a-google.csv (times are UTC; use UTC working hours 9 to 17).`,
  },
  {
    name: "team-delivery-health/team-b-12-weeks",
    team: "team-b",
    prompt: `/em-tools:team-delivery-health 12 weeks: window 2026-07-27 to 2026-10-16, comparison 2026-05-04 to 2026-07-24. ${common} PRs: ${F}/github/team-b-prs.csv. Deployments are weekly app releases: ${F}/github/team-b-deployments.csv. Incidents: ${F}/incidents/team-b-incidents.csv. Calendar: ${F}/calendar/team-b-outlook.csv (times are UTC; use UTC working hours 9 to 17).`,
  },
  {
    name: "ai-adoption/team-b-all",
    team: "team-b",
    prompt: `/em-tools:ai-adoption all, window 2026-05-11 to 2026-10-16. ${common} Usage: ${F}/ai/usage.csv (filter to team Team B). PRs: ${F}/github/team-b-prs.csv. Spend: ${F}/ai/spend.csv (filter to team Team B).`,
  },
  {
    name: "ai-adoption/team-a-adoption-roi-quality",
    team: "team-a",
    prompt: `/em-tools:ai-adoption adoption roi quality, window 2026-06-01 to 2026-10-16. Also, which of my engineers are the lowest AI users? ${common} Usage: ${F}/ai/usage.csv (filter to team Team A). PRs: ${F}/github/team-a-prs.csv. Spend: ${F}/ai/spend.csv (filter to team Team A).`,
  },
  {
    name: "dependency-register/team-a",
    team: "team-a",
    prompt: `/em-tools:dependency-register. ${common} Tickets: ${F}/linear/team-a-issues.csv. Public Slack channel export: ${F}/slack/team-a-messages.json. Other teams' tracker items visible to us: ${F}/jira/team-b-issues.csv.`,
  },
  {
    name: "oncall-health/team-a-12-weeks",
    team: "team-a",
    prompt: `/em-tools:oncall-health 12 weeks: window 2026-07-27 to 2026-10-16, comparison 2026-05-04 to 2026-07-24, working hours 09:00 to 17:00 UTC. ${common} PagerDuty pages export: ${F}/pagerduty/team-a-pages.csv. Schedule export: ${F}/pagerduty/team-a-shifts.csv. Incidents: ${F}/incidents/team-a-incidents.csv.`,
  },
  {
    name: "oncall-health/team-b-12-weeks",
    team: "team-b",
    prompt: `/em-tools:oncall-health 12 weeks: window 2026-07-27 to 2026-10-16, comparison 2026-05-04 to 2026-07-24, working hours 09:00 to 17:00 UTC. Also, who on the team gets paged the most? ${common} incident.io alerts export: ${F}/incident-io/team-b-pages.csv. Schedule export: ${F}/incident-io/team-b-shifts.csv. Incidents: ${F}/incidents/team-b-incidents.csv.`,
  },
  {
    name: "feedback-rehearsal/eng-a2",
    team: "team-a",
    prompt: `/em-tools:feedback-rehearsal A2. My observation is in ${F}/feedback/team-a-eng-a2.md. ${common}`,
  },
  {
    name: "feedback-rehearsal/eng-b4",
    team: "team-b",
    prompt: `/em-tools:feedback-rehearsal B4. My observation is in ${F}/feedback/team-b-eng-b4.md. Also, is B4 worse at releases than the rest of the team? ${common}`,
  },
];

rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });
for (const ex of EXAMPLES) {
  if (ONLY.length && !ONLY.some((o) => ex.name.includes(o))) continue;
  const notes = join(WORK, ex.name.replace("/", "_"), "notes");
  cpSync(join(F, "notes", ex.team), notes, { recursive: true });
  const settings = join(WORK, ex.name.replace("/", "_"), "settings.json");
  writeFileSync(settings, JSON.stringify({ pluginConfigs: { "em-tools@inline": { options: { locale: ex.team === "team-a" ? "en-GB" : "en-US", notes_folder: notes, enabled_integrations: [] } } } }));
  process.stdout.write(`running ${ex.name} ... `);
  const r = spawnSync("claude", ["-p", "--plugin-dir", REPO, "--settings", settings, "--permission-mode", "bypassPermissions", ex.prompt], {
    cwd: dirname(notes), encoding: "utf8", timeout: 900_000, maxBuffer: 20 * 1024 * 1024,
  });
  const out = join(REPO, "examples", `${ex.name}.md`);
  mkdirSync(dirname(out), { recursive: true });
  const header = `<!-- em-tools example. Generated by scripts/run-examples.mjs against synthetic fixtures, zero integrations, locale ${ex.team === "team-a" ? "en-GB" : "en-US"}. -->\n\n`;
  writeFileSync(out, header + (r.stdout ?? "").trim() + "\n");
  console.log(r.status === 0 ? "ok" : `exit ${r.status} ${r.stderr?.slice(0, 200) ?? ""}`);
}
