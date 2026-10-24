#!/usr/bin/env node
// em-tools read-only guard. Runs as a PreToolUse hook.
//
// Mode "plugin" (hooks/hooks.json): every tool from an em-tools MCP server must be on
// the read allowlist, and its integration must be enabled. Anything else is blocked.
// Mode "session" (skill frontmatter): also blocks write and send tools on any other
// MCP server for the rest of the session once an em-tools skill has run.
//
// Blocking uses exit code 2 with the reason on stderr. No data is logged or sent.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PLUGIN_PREFIX = /^mcp__plugin_em-tools_(.+?)__(.+)$/;
const OTHER_MCP = /^mcp__(.+?)__(.+)$/;

const READ_WORDS = new Set([
  "get", "list", "search", "read", "fetch", "query", "find", "lookup", "describe",
  "view", "show", "ask", "count", "aggregate", "check", "suggest", "explore", "extract", "schema",
  "info", "whoami", "me",
]);

const WRITE_WORDS = new Set([
  "create", "update", "delete", "write", "save", "send", "post", "reply", "forward", "merge", "push",
  "respond", "share", "unshare", "add", "remove", "resolve", "unresolve", "submit", "mark",
  "trash", "untrash", "move", "execute", "do", "call", "fork", "star", "dismiss",
  "approve", "trigger", "rerun", "comment", "react", "reaction", "upload", "invite", "archive", "edit",
  "set", "cancel", "publish", "transfer", "enable", "disable", "restore", "retire", "rename", "assign",
  "close", "reopen", "apply", "deploy", "run", "revoke", "rotate", "import", "duplicate", "copy",
  "modify", "patch", "put", "insert", "manage", "prepare", "convert", "spawn", "stop",
  "pause", "unpause", "buy", "record", "generate", "draft", "invoke", "kill", "attach", "transition",
  "accept", "reject", "decline", "pin", "unpin", "sync", "toggle", "clear", "reset", "rebase",
]);

export function words(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

export function looksReadOnly(toolName) {
  const w = words(toolName);
  if (w.some((x) => WRITE_WORDS.has(x))) return false;
  return w.some((x) => READ_WORDS.has(x));
}

export function parseEnabled(raw) {
  if (raw === undefined) return null; // option not visible to this process: skip the check
  const text = String(raw).trim();
  if (text === "") return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim().toLowerCase());
  } catch {
    // not JSON, fall through
  }
  return text.split(/[\s,]+/).filter(Boolean).map((s) => s.toLowerCase());
}

export function decide(toolName, mode, allowlist, enabled) {
  const own = PLUGIN_PREFIX.exec(toolName);
  if (own) {
    const [, server, tool] = own;
    const entry = allowlist.servers[server];
    if (!entry) return `em-tools blocked ${toolName}: unknown server "${server}".`;
    if (entry.allow !== "*" && !entry.allow.includes(tool)) {
      return `em-tools blocked ${toolName}: em-tools is read-only and "${tool}" is not on the read allowlist for ${server}. Produce a draft for the EM to copy instead.`;
    }
    if (entry.integration && enabled !== null && !entry.integration.some((i) => enabled.includes(i))) {
      return `em-tools blocked ${toolName}: the ${entry.integration.join(" or ")} integration is not enabled in em-tools settings. Ask the EM to paste the data instead.`;
    }
    return null;
  }
  if (mode === "session") {
    const other = OTHER_MCP.exec(toolName);
    if (other && !looksReadOnly(other[2])) {
      return `em-tools blocked ${toolName}: an em-tools skill ran in this session, so MCP tools that write, send or post are blocked. Produce a draft for the EM to copy instead.`;
    }
  }
  return null;
}

function loadAllowlist() {
  const here = dirname(fileURLToPath(import.meta.url));
  return JSON.parse(readFileSync(join(here, "read-allowlist.json"), "utf8"));
}

async function main() {
  const mode = process.argv[2] === "session" ? "session" : "plugin";
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  let toolName = "";
  try {
    toolName = JSON.parse(input).tool_name || "";
  } catch {
    process.stderr.write("em-tools guard could not read the hook input, so the call is blocked.\n");
    process.exit(2);
  }
  let reason;
  try {
    reason = decide(toolName, mode, loadAllowlist(), parseEnabled(process.env.CLAUDE_PLUGIN_OPTION_ENABLED_INTEGRATIONS));
  } catch (err) {
    reason = `em-tools guard failed (${err.message}), so the call is blocked.`;
  }
  if (reason) {
    process.stderr.write(reason + "\n");
    process.exit(2);
  }
  process.exit(0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
