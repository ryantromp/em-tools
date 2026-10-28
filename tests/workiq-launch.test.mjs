import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { reply, workiqEnabled, WORKIQ_PACKAGE } from "../server/workiq-launch.mjs";

test("Work IQ starts only for outlook or teams, at a pinned version", () => {
  assert.equal(workiqEnabled('["github","linear"]'), false);
  assert.equal(workiqEnabled(""), false);
  assert.equal(workiqEnabled(undefined), false);
  assert.equal(workiqEnabled('["outlook"]'), true);
  assert.equal(workiqEnabled("github, teams"), true);
  assert.match(WORKIQ_PACKAGE, /^@microsoft\/workiq@\d+\.\d+\.\d+$/);
  const mcp = JSON.parse(readFileSync(new URL("../.mcp.json", import.meta.url)));
  assert.doesNotMatch(JSON.stringify(mcp), /npx/);
});

test("when off, it answers as an MCP server with no tools", () => {
  assert.equal(reply({ jsonrpc: "2.0", method: "notifications/initialized" }), null);
  assert.deepEqual(reply({ jsonrpc: "2.0", id: 2, method: "tools/list" }).result, { tools: [] });
  const input = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } },
    { jsonrpc: "2.0", id: 2, method: "tools/list" },
  ].map((m) => JSON.stringify(m)).join("\n") + "\n";
  const r = spawnSync("node", ["server/workiq-launch.mjs"], { input, env: { ...process.env, EM_TOOLS_ENABLED_INTEGRATIONS: '["github"]' } });
  const lines = r.stdout.toString().trim().split("\n").map((l) => JSON.parse(l));
  assert.equal(lines[0].result.capabilities.tools !== undefined, true);
  assert.deepEqual(lines[1].result.tools, []);
});
