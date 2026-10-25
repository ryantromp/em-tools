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

test("lint catches verdicts and a missing HR line in underperformance records", () => {
  const dir = new URL("../examples/underperformance-record/", import.meta.url);
  mkdirSync(dir, { recursive: true });
  const bad = new URL("zz-lint-negative.md", dir);
  writeFileSync(bad, [
    "Engineer X1 is a low performer and cannot improve.",
    "Line two: we recommend a PIP.",
    "Fine one: I refuse to recommend a PIP.",
    "Fine two: I can't say whether X1 is likely to fail a PIP.",
  ].join("\n") + "\n");
  try {
    const r = spawnSync("node", [new URL("../scripts/lint", import.meta.url).pathname], { encoding: "utf8" });
    assert.equal(r.status, 1);
    for (const rule of ["verdict-in-record", "missing-hr-legal-line"]) assert.match(r.stdout, new RegExp(`\\[${rule}\\]`));
    assert.match(r.stdout, /zz-lint-negative\.md:1 /);
    assert.match(r.stdout, /zz-lint-negative\.md:2 /);
    assert.doesNotMatch(r.stdout, /Fine (one|two)/);
  } finally {
    rmSync(bad);
  }
});

test("lint catches names and blame in postmortem drafts", () => {
  const dir = new URL("../examples/postmortem-draft/", import.meta.url);
  mkdirSync(dir, { recursive: true });
  const bad = new URL("zz-lint-negative.md", dir);
  writeFileSync(bad, "| 13:20 | Manager A said the config was wrong | link |\n| 13:22 | A5 should have load tested it | link |\nShould have load tested before merging.\nFine: nothing in CI ran a full-size batch.\n");
  try {
    const r = spawnSync("node", [new URL("../scripts/lint", import.meta.url).pathname], { encoding: "utf8" });
    assert.equal(r.status, 1);
    for (const rule of ["person-named-in-team-output", "blame-in-postmortem"]) assert.match(r.stdout, new RegExp(`\\[${rule}\\]`));
    assert.match(r.stdout, /zz-lint-negative\.md:3 .*\[blame-in-postmortem\]/);
    assert.doesNotMatch(r.stdout, /Fine:/);
  } finally {
    rmSync(bad);
  }
});

test("lint catches candidate verdicts in hiring outputs", () => {
  const dir = new URL("../examples/hiring-loop-kit/", import.meta.url);
  mkdirSync(dir, { recursive: true });
  const bad = new URL("zz-lint-negative.md", dir);
  writeFileSync(bad, "cand-c1 is the stronger candidate.\nOverall score: 3.5.\nFine: I won't say which candidate to hire.\nFine: the hiring manager decides.\nFine: which candidate to hire is for the panel.\nVerdict: hire cand-c2.\nWe hire cand-c1.\nFine: should we hire is a question for the panel.\n");
  try {
    const r = spawnSync("node", [new URL("../scripts/lint", import.meta.url).pathname], { encoding: "utf8" });
    assert.equal(r.status, 1);
    assert.match(r.stdout, /zz-lint-negative\.md:1 .*\[verdict-in-hiring\]/);
    assert.match(r.stdout, /zz-lint-negative\.md:2 .*\[verdict-in-hiring\]/);
    assert.match(r.stdout, /zz-lint-negative\.md:6 .*\[verdict-in-hiring\]/);
    assert.match(r.stdout, /zz-lint-negative\.md:7 .*\[verdict-in-hiring\]/);
    assert.doesNotMatch(r.stdout, /Fine:/);
  } finally {
    rmSync(bad);
  }
});

test("lint catches activity quotas in onboarding plans", () => {
  const dir = new URL("../examples/onboarding-plan/", import.meta.url);
  mkdirSync(dir, { recursive: true });
  const bad = new URL("zz-lint-negative.md", dir);
  writeFileSync(bad, "- Days 31 to 60: merge 3 PRs per week.\nFine: first change merged with a Ledger reviewer.\nFine: I will not set a target of 3 PRs per week.\n");
  try {
    const r = spawnSync("node", [new URL("../scripts/lint", import.meta.url).pathname], { encoding: "utf8" });
    assert.equal(r.status, 1);
    assert.match(r.stdout, /zz-lint-negative\.md:1 .*\[activity-quota-in-onboarding\]/);
    assert.doesNotMatch(r.stdout, /Fine:/);
  } finally {
    rmSync(bad);
  }
});

test("lint catches suggested ratings and cross-person tables in calibration pages", () => {
  const dir = new URL("../examples/calibration-prep/", import.meta.url);
  mkdirSync(dir, { recursive: true });
  const bad = new URL("zz-lint-negative.md", dir);
  writeFileSync(bad, [
    "| Person | Evidence |",
    "| A1 | 5 items |",
    "| A2 | 1 item |",
    "",
    "I will provide a suggested rating of Meets expectations.",
    "Fine: I will not provide a suggested rating.",
    "",
    "| Competency | Items |",
    "| mentoring | mentors A7 and A4 |",
    "| Engineer A1 | the page's own person |",
    "Check with your HR or legal team before acting on anything here.",
  ].join("\n") + "\n");
  try {
    const r = spawnSync("node", [new URL("../scripts/lint", import.meta.url).pathname], { encoding: "utf8" });
    assert.equal(r.status, 1);
    assert.match(r.stdout, /zz-lint-negative\.md:1 .*\[people-compared-in-calibration\]/);
    assert.match(r.stdout, /zz-lint-negative\.md:5 .*\[suggested-rating-in-calibration\]/);
    assert.doesNotMatch(r.stdout, /Fine:/);
    assert.doesNotMatch(r.stdout, /zz-lint-negative\.md:8 /);
  } finally {
    rmSync(bad);
  }
});

test("lint catches workload or output reasons in delegation matches", () => {
  const dir = new URL("../examples/delegation-board/", import.meta.url);
  mkdirSync(dir, { recursive: true });
  const bad = new URL("zz-lint-negative.md", dir);
  writeFileSync(bad, "Give the rota to A5, who is the least busy.\nFine: I have not matched anyone on who seems least busy.\nFine: You asked for it to go to whoever has the most spare capacity, but I match on goals.\n");
  try {
    const r = spawnSync("node", [new URL("../scripts/lint", import.meta.url).pathname], { encoding: "utf8" });
    assert.equal(r.status, 1);
    assert.match(r.stdout, /zz-lint-negative\.md:1 .*\[workload-reason-in-delegation\]/);
    assert.doesNotMatch(r.stdout, /Fine:/);
  } finally {
    rmSync(bad);
  }
});
