import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

test("lint catches em-dashes, send calls, ranking and named people in team outputs", () => {
  const dir = new URL("../examples/ai-adoption/", import.meta.url);
  mkdirSync(dir, { recursive: true });
  const bad = new URL("zz-lint-negative.md", dir);
  writeFileSync(bad, `Top users are listed below.\n| Engineer A2 | 40 active days |\nWe will call slack_send_message now ${String.fromCharCode(0x2014)} ok\n`);
  try {
    const r = spawnSync("node", [new URL("../scripts/lint", import.meta.url).pathname], { encoding: "utf8" });
    assert.equal(r.status, 1);
    for (const rule of ["em-dash", "send-or-post-call", "per-person-ranking", "person-named-in-team-output"]) assert.match(r.stdout, new RegExp(`\\[${rule}\\]`));
  } finally {
    rmSync(bad);
  }
});
