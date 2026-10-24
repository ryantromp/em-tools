import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig, validLocale } from "../src/config.ts";
import { Notes } from "../src/notes.ts";

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
