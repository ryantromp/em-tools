#!/usr/bin/env node
// Starts Microsoft Work IQ only when Outlook or Teams is enabled in em-tools settings,
// at a pinned version. Otherwise it answers as an MCP server with no tools, so no
// package is downloaded or run.
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

export const WORKIQ_PACKAGE = "@microsoft/workiq@1.0.1";

export function workiqEnabled(raw) {
  const text = String(raw ?? "").toLowerCase();
  return /\b(outlook|teams)\b/.test(text);
}

export function reply(msg) {
  if (msg.id === undefined || msg.id === null) return null; // notification
  if (msg.method === "initialize") {
    return {
      jsonrpc: "2.0", id: msg.id,
      result: {
        protocolVersion: msg.params?.protocolVersion ?? "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "workiq (off in em-tools settings)", version: "0" },
        instructions: "Work IQ is off. Enable outlook or teams in em-tools settings to start it.",
      },
    };
  }
  if (msg.method === "tools/list") return { jsonrpc: "2.0", id: msg.id, result: { tools: [] } };
  if (msg.method === "ping") return { jsonrpc: "2.0", id: msg.id, result: {} };
  return { jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: "Work IQ is off in em-tools settings." } };
}

function serveEmpty() {
  const rl = createInterface({ input: process.stdin });
  rl.on("line", (line) => {
    let msg;
    try { msg = JSON.parse(line); } catch { return; }
    const out = reply(msg);
    if (out) process.stdout.write(JSON.stringify(out) + "\n");
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (workiqEnabled(process.env.EM_TOOLS_ENABLED_INTEGRATIONS)) {
    const child = spawn("npx", ["-y", WORKIQ_PACKAGE, "mcp"], { stdio: "inherit" });
    child.on("exit", (code) => process.exit(code ?? 1));
  } else {
    serveEmpty();
  }
}
