#!/usr/bin/env node
// em-tools read-only guard. Runs as a PreToolUse hook.
//
// Mode "plugin" (hooks/hooks.json): every tool from an em-tools MCP server must be on
// the read allowlist, and its integration must be enabled. Anything else is blocked.
// Mode "session" (skill frontmatter): also blocks write and send tools on any other
// MCP server for the rest of the session once an em-tools skill has run, and shell
// commands that send data out (curl, wget, gh writes, git push and similar).
// The shell check catches mistakes; it is not a sandbox. See CONNECTORS.md.
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

// Shell commands that send data out of the machine. Checked per command segment.
const SEND_COMMANDS = new Set([
  "curl", "wget", "http", "https", "xh", "httpie", "nc", "ncat", "netcat", "telnet", "socat",
  "ssh", "scp", "sftp", "rsync", "ftp", "mail", "mailx", "sendmail", "mutt", "osascript",
]);
const PREFIX_WORDS = new Set(["sudo", "env", "command", "exec", "time", "nohup", "nice", "xargs", "builtin"]);
const GH_READ = /^(pr|issue|repo|run|release|workflow|label|search|status|browse)$/;
const GH_READ_SUB = /^(view|list|diff|status|checks|search)$/;
const INTERPRETERS = new Set(["python", "python3", "node", "ruby", "perl", "deno", "bun", "php"]);
// Network calls as code, not bare words, so a file such as requests.csv or socket-notes.md is fine.
const NETWORK_CODE = new RegExp([
  String.raw`https?:\/\/`,
  String.raw`\b(import|from)\s+(requests|urllib|socket|http\.client|httpx|aiohttp|smtplib|ftplib)\b`,
  String.raw`\b(requests|httpx)\.(get|post|put|patch|delete|head|request|Session)\b`,
  String.raw`\burllib\.request\b|\burlopen\s*\(`,
  String.raw`\bsocket\.(socket|create_connection)\b`,
  String.raw`\bfetch\s*\(`,
  String.raw`\b(axios|undici)\b\s*[.(]`,
  String.raw`require\(\s*["'](node:)?(https?|net|dgram|tls|axios|undici)["']`,
  String.raw`from\s+["'](node:)?(https?|net|dgram|tls|axios|undici)["']`,
  String.raw`\bnet\.connect\b|XMLHttpRequest|\bLWP::|Net::HTTP`,
].join("|"));

export function segments(command) {
  return String(command).split(/\|\||&&|[;|&\n]|\$\(|`|\(|\)/).map((x) => x.trim()).filter(Boolean);
}

function commandWords(segment) {
  const w = segment.split(/\s+/);
  let i = 0;
  while (i < w.length && (PREFIX_WORDS.has(w[i]) || /^[A-Za-z_][A-Za-z0-9_]*=/.test(w[i]) || (i > 0 && PREFIX_WORDS.has(w[i - 1]) && /^-/.test(w[i])))) i++;
  return w.slice(i).map((x, j) => (j === 0 ? x.split("/").pop() : x));
}

export function shellSends(command) {
  // Inline code for an interpreter spans quotes, parentheses and semicolons, so check the whole command.
  const runsInterpreter = segments(command).some((seg) => INTERPRETERS.has((commandWords(seg)[0] ?? "").replace(/[0-9.]+$/, "")));
  if (runsInterpreter && NETWORK_CODE.test(String(command))) return "an interpreter with network code";
  for (const seg of segments(command)) {
    const [cmd, ...args] = commandWords(seg);
    if (!cmd) continue;
    if (SEND_COMMANDS.has(cmd)) return cmd;
    if (cmd === "git" && args.some((a) => a === "push" || a === "send-email" || a === "request-pull")) return `git ${args.find((a) => !a.startsWith("-"))}`;
    if (cmd === "gh") {
      const [group, sub] = args.filter((a) => !a.startsWith("-"));
      if (group === "api") {
        const writes = args.some((a) => /^(-X|--method|-f|-F|--field|--raw-field|--input)(=|$)/.test(a) || /^-[XfF]./.test(a));
        if (writes && !args.some((a, k) => /^(-X|--method)$/.test(a) && /^get$/i.test(args[k + 1] ?? "")) ) return "gh api with a write method or fields";
        continue;
      }
      if (group === "search" || (group && GH_READ.test(group) && (!sub || GH_READ_SUB.test(sub)))) continue;
      return `gh ${[group, sub].filter(Boolean).join(" ")}`;
    }
  }
  return null;
}

export function decideShell(command) {
  const hit = shellSends(command);
  return hit
    ? `em-tools blocked a shell command (${hit}): an em-tools skill ran in this session, so commands that send data out are blocked. Produce a draft for the EM to copy instead.`
    : null;
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
  let toolInput = {};
  try {
    const parsed = JSON.parse(input);
    toolName = parsed.tool_name || "";
    toolInput = parsed.tool_input || {};
  } catch {
    process.stderr.write("em-tools guard could not read the hook input, so the call is blocked.\n");
    process.exit(2);
  }
  let reason;
  try {
    reason = toolName === "Bash"
      ? (mode === "session" ? decideShell(toolInput.command ?? "") : null)
      : decide(toolName, mode, loadAllowlist(), parseEnabled(process.env.CLAUDE_PLUGIN_OPTION_ENABLED_INTEGRATIONS));
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
