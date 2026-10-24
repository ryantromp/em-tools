import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

test("prebuilt server lists only notes and metrics tools", async () => {
  const notes = mkdtempSync(join(tmpdir(), "em-srv-"));
  const transport = new StdioClientTransport({
    command: "node",
    args: [new URL("../dist/em-tools-server.mjs", import.meta.url).pathname],
    env: { ...process.env, EM_TOOLS_NOTES_FOLDER: notes, EM_TOOLS_LOCALE: "en-GB" } as Record<string, string>,
  });
  const client = new Client({ name: "test", version: "0" });
  await client.connect(transport);
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name).sort();
  assert.ok(names.every((n) => n.startsWith("notes_") || n.startsWith("metrics_")), names.join(","));
  assert.ok(!names.some((n) => /delete|send|post/.test(n)));
  const status = await client.callTool({ name: "notes_status", arguments: {} });
  const body = JSON.parse((status.content as Array<{ text: string }>)[0].text);
  assert.equal(body.locale, "en-GB");
  assert.equal(body.notes_problem, null);
  const bad = await client.callTool({ name: "notes_read_person", arguments: { slug: "nobody" } });
  assert.equal(bad.isError, true);
  await client.close();
});
