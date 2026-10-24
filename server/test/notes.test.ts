import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig, validLocale } from "../src/config.ts";
import { ExpectationItem, Notes, expectationGaps } from "../src/notes.ts";

function folder() {
  return mkdtempSync(join(tmpdir(), "em-notes-"));
}

test("config refuses a notes folder inside plugin data", () => {
  const data = folder();
  const inside = join(data, "notes");
  mkdirSync(inside);
  const cfg = loadConfig({ EM_TOOLS_NOTES_FOLDER: inside, EM_TOOLS_PLUGIN_DATA: data, EM_TOOLS_LOCALE: "en-GB" });
  assert.equal(cfg.notesFolder, null);
  assert.match(cfg.notesProblem!, /overlaps/);
});

test("config treats an unsubstituted placeholder as unset", () => {
  const cfg = loadConfig({ EM_TOOLS_NOTES_FOLDER: "${user_config.notes_folder}", EM_TOOLS_LOCALE: "${user_config.locale}" });
  assert.match(cfg.notesProblem!, /not set/);
  assert.match(cfg.localeProblem!, /not set/);
});

test("locale validation", () => {
  assert.equal(validLocale("en-GB"), true);
  assert.equal(validLocale("en-us"), true);
  assert.equal(validLocale("english"), false);
  assert.equal(loadConfig({ EM_TOOLS_LOCALE: "en-us", EM_TOOLS_NOTES_FOLDER: folder() }).locale, "en-US");
});

test("create, append, evidence, never overwrite, keep backups", () => {
  const f = folder();
  const n = new Notes(f);
  n.createPerson("eng-x1", { name: "Engineer X1", team: "platform" });
  assert.throws(() => n.createPerson("eng-x1", { name: "x" }), /never overwrites/);
  n.appendEntry("eng-x1", "Log", "### 2026-10-01 1:1\nFirst entry.");
  n.appendEntry("eng-x1", "Log", "### 2026-10-08 1:1\nSecond entry.");
  n.appendEntry("eng-x1", "Actions", "- [ ] EM: share RFC template (due 2026-10-10)");
  const item = {
    id: "ev-1", person: "eng-x1", source: "github", date: "2026-10-02", link: "https://example.com/pr/1",
    situation: "Release blocked", behaviour: "Wrote the fix and a test", impact: "Release shipped same day", competency: "execution", captured: "2026-10-03",
  };
  assert.equal(n.addEvidence(item).added, true);
  assert.equal(n.addEvidence(item).added, false);
  assert.throws(() => n.addEvidence({ ...item, id: "ev-2", link: null }), /link/);
  const doc = n.readPerson("eng-x1");
  assert.ok(doc.sections.Log.indexOf("Second") < doc.sections.Log.indexOf("First"));
  assert.equal(doc.evidence.length, 1);
  assert.equal(doc.frontmatter.slug, "eng-x1");
  assert.ok(existsSync(join(f, "people", "eng-x1.md.bak")));
  assert.deepEqual(n.listPeople("platform").map((p) => p.slug), ["eng-x1"]);
  assert.throws(() => n.readPerson("../etc/passwd"), /valid person slug/);
  assert.throws(() => n.updateFrontmatter("eng-x1", { slug: "other" }), /cannot be changed/);
});

test("drafts never overwrite", () => {
  const n = new Notes(folder());
  const a = n.saveDraft("upward-update", "2026-10-23", "one");
  const b = n.saveDraft("upward-update", "2026-10-23", "two");
  assert.notEqual(a, b);
  assert.equal(readFileSync(a, "utf8"), "one");
});

test("parses a hand-written person file", () => {
  const f = folder();
  mkdirSync(join(f, "people"));
  const text = `---\nname: A5\nteam: core\n---\n# A5\n\n## Log\n\nhello\n\n## Evidence\n\n\`\`\`yaml evidence\nid: e1\nperson: sam\nsource: note\ndate: 2026-09-01\nlink: null\nsituation: s\nbehaviour: b\nimpact: i\ncompetency: null\ncaptured: 2026-09-01\n\`\`\`\n`;
  require_write(join(f, "people", "sam.md"), text);
  const doc = new Notes(f).readPerson("sam");
  assert.equal(doc.sections.Log, "hello");
  assert.equal(doc.evidence[0].id, "e1");
  assert.equal(readdirSync(join(f, "people")).length, 1);
});

import { writeFileSync } from "node:fs";
function require_write(p: string, t: string) {
  writeFileSync(p, t);
}

function teamFolder(storage?: string) {
  const f = folder();
  writeFileSync(join(f, "team.md"), `---\nteam: Team X\nmembers:\n  - eng-x1\n${storage ? `expectations_storage: ${storage}\n` : ""}---\n\n# Team X\n\nBody text stays.\n`);
  const n = new Notes(f);
  n.createPerson("eng-x1", { name: "Engineer X1", team: "Team X" });
  return { f, n };
}

const exp = (over: Record<string, unknown> = {}) => ({
  id: "ex-1", person: "eng-x1", kind: "expectation", date: "2026-08-11", how: "1:1",
  in_writing: false, text: "PRs under 300 lines.", captured: "2026-08-11", ...over,
});

test("expectations need a storage choice first, then save it in team.md", () => {
  const { f, n } = teamFolder();
  assert.throws(() => n.addExpectation(exp()), /expectations_storage/);
  n.setExpectationsStorage("separate-file");
  const team = readFileSync(join(f, "team.md"), "utf8");
  assert.match(team, /expectations_storage: separate-file/);
  assert.match(team, /Body text stays\./);
  assert.ok(existsSync(join(f, "team.md.bak")));
});

test("separate-file records stay out of the person file and the people list", () => {
  const { f, n } = teamFolder("separate-file");
  assert.equal(n.addExpectation(exp()).added, true);
  assert.equal(n.addExpectation(exp()).added, false);
  const sep = readFileSync(join(f, "people", "eng-x1.expectations.md"), "utf8");
  assert.match(sep, /```yaml expectation/);
  assert.doesNotMatch(readFileSync(join(f, "people", "eng-x1.md"), "utf8"), /Expectations/);
  assert.deepEqual(n.listPeople().map((p) => p.slug), ["eng-x1"]);
});

test("person-file records survive later writes, and switching reads both places", () => {
  const { n } = teamFolder("person-file");
  n.addExpectation(exp());
  n.appendEntry("eng-x1", "Log", "### 2026-08-25 1:1\nLater entry.");
  n.updateFrontmatter("eng-x1", { level: "E3" });
  assert.equal(n.readPerson("eng-x1").extra.find((x) => x.heading === "Expectations")?.content.includes("ex-1"), true);
  n.setExpectationsStorage("separate-file");
  n.addExpectation(exp({ id: "ex-2", kind: "support", date: "2026-08-12", text: "Daily check-in." }));
  assert.equal(n.addExpectation(exp()).added, false);
  const r = n.listExpectations("eng-x1", "2026-08-20");
  assert.deepEqual(r.items.map((e) => e.id), ["ex-1", "ex-2"]);
  assert.deepEqual(r.found_in, { person_file: 1, separate_file: 1 });
});

test("wellbeing records hold a date only", () => {
  const { n } = teamFolder("person-file");
  assert.throws(() => n.addExpectation(exp({ id: "w", kind: "wellbeing_raised", text: "Sleeping badly." })), /no text/);
  assert.equal(n.addExpectation(exp({ id: "w", kind: "wellbeing_raised", text: "" })).added, true);
  assert.throws(() => n.addExpectation(exp({ id: "e", text: "" })), /text is required/);
});

test("expectation gaps are facts about missing steps", () => {
  const items = [ExpectationItem.parse(exp())];
  const kinds = (now: string, list = items) => expectationGaps(list, now).map((g) => g.kind);
  assert.deepEqual(kinds("2026-08-20"), ["no_written_follow_up", "no_support_recorded", "no_hr_contact_recorded"]);
  assert.ok(kinds("2026-09-20").includes("no_change_recorded"));
  const full = [
    ...items,
    ExpectationItem.parse(exp({ id: "f", kind: "follow_up", date: "2026-08-12", in_writing: true, text: "Sent summary." })),
    ExpectationItem.parse(exp({ id: "s", kind: "support", date: "2026-08-12", text: "Pairing." })),
    ExpectationItem.parse(exp({ id: "p", kind: "progress", date: "2026-09-22", text: "PR sizes down." })),
    ExpectationItem.parse(exp({ id: "h", kind: "hr", date: "2026-08-13", text: "Spoke to HR partner." })),
  ];
  assert.deepEqual(kinds("2026-10-10", full), []);
  assert.deepEqual(expectationGaps([], "2026-10-10"), []);
});

test("backticks in a record round-trip, and impossible dates are rejected", () => {
  const { n } = teamFolder("separate-file");
  const text = "Use ``` fences in PR descriptions.\n```\nand this line too.";
  n.addExpectation(exp({ text }));
  const r = n.listExpectations("eng-x1", "2026-08-20");
  assert.equal(r.items[0]?.text, text);
  assert.deepEqual(r.invalid, []);
  assert.equal(n.addExpectation(exp({ text })).added, false);
  assert.throws(() => n.addExpectation(exp({ id: "bad", date: "2026-13-01" })), /calendar date/);
  assert.throws(() => n.addExpectation(exp({ id: "bad", date: "2026-02-30" })), /calendar date/);
});

test("a hand-edited impossible date is reported as invalid, not a crash", () => {
  const { f, n } = teamFolder("separate-file");
  n.addExpectation(exp());
  const p = join(f, "people", "eng-x1.expectations.md");
  writeFileSync(p, readFileSync(p, "utf8").replace('date: "2026-08-11"', 'date: "2026-13-01"').replace("date: 2026-08-11", "date: 2026-13-01"));
  const r = n.listExpectations("eng-x1", "2026-08-20");
  assert.equal(r.items.length, 0);
  assert.equal(r.invalid.length, 1);
  assert.doesNotThrow(() => n.addExpectation(exp({ id: "ex-2" })));
});

test("hiring docs never overwrite and candidate notes are append-only with no scores", () => {
  const f = folder();
  const n = new Notes(f);
  const a = n.saveHiringDoc("senior-backend", "loop-plan", "2026-10-19", "# Plan");
  const b = n.saveHiringDoc("senior-backend", "loop-plan", "2026-10-19", "# Plan v2");
  assert.notEqual(a, b);
  assert.equal(readFileSync(a, "utf8"), "# Plan\n");
  assert.throws(() => n.saveHiringDoc("../x", "loop-plan", "2026-10-19", "x"), /role slug/);
  assert.throws(() => n.saveHiringDoc("senior-backend", "loop-plan", "2026-02-30", "x"), /real/);
  const note = { id: "c1-design", candidate: "cand-c1", kind: "scorecard", stage: "system design", interviewer: "Engineer X1", date: "2026-10-14", text: "Asked about idempotency first. Strong on: retries.", captured: "2026-10-14" };
  assert.equal(n.addCandidateNote("senior-backend", note).added, true);
  assert.equal(n.addCandidateNote("senior-backend", note).added, false);
  n.addCandidateNote("senior-backend", { ...note, id: "c1-screen", stage: "screen", date: "2026-10-07", text: "Uses ``` in notes." });
  assert.throws(() => n.addCandidateNote("senior-backend", { ...note, id: "x", score: 4, recommendation: "hire" }), /score|recommendation|Unrecognized/i);
  const r = n.readCandidate("senior-backend", "cand-c1");
  assert.deepEqual(r.items.map((x) => x.id), ["c1-screen", "c1-design"]);
  assert.ok(!("score" in r.items[0]));
  const l = n.listHiring("senior-backend");
  assert.deepEqual(l.docs.length, 2);
  assert.deepEqual(l.candidates[0].scorecards.map((s) => s.stage), ["system design", "screen"]);
  assert.ok(!JSON.stringify(l).includes("idempotency"));
  assert.deepEqual(n.listHiring("unknown-role"), { role: "unknown-role", docs: [], candidates: [] });
});
