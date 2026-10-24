import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
import { z } from "zod";

export const SECTIONS = ["Log", "Open threads", "Actions", "Evidence"] as const;
export type Section = (typeof SECTIONS)[number];

const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
// A real calendar date, so 2026-13-01 or 2026-02-30 is rejected.
const calendarDate = () => z.string().regex(ISO_DATE).refine((d) => {
  const t = Date.parse(d + "T00:00:00Z");
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === d;
}, { message: "not a real calendar date" });
// Closing fences count only at the start of a line, so backticks inside a YAML value are safe.
const fenced = (tag: string) => new RegExp("^```yaml " + tag + "\\n([\\s\\S]*?)^```[ \\t]*$", "gm");

export const EvidenceItem = z.object({
  id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/),
  person: z.string().regex(SLUG),
  source: z.enum(["note", "github", "linear", "jira", "slack", "teams", "calendar", "manual"]),
  date: z.string().regex(ISO_DATE),
  link: z.string().url().nullable(),
  situation: z.string().min(1),
  behaviour: z.string().min(1),
  impact: z.string().min(1),
  competency: z.string().nullable().default(null),
  captured: z.string().regex(ISO_DATE),
}).refine((e) => e.link !== null || e.source === "note" || e.source === "manual", {
  message: "link is required unless source is note or manual",
  path: ["link"],
});
export type EvidenceItem = z.infer<typeof EvidenceItem>;

export const EXPECTATION_KINDS = ["expectation", "support", "progress", "follow_up", "hr", "wellbeing_raised"] as const;
export const STORAGE_MODES = ["person-file", "separate-file"] as const;
export type StorageMode = (typeof STORAGE_MODES)[number];
export const EXPECTATIONS_HEADING = "Expectations";

export const ExpectationItem = z.object({
  id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/),
  person: z.string().regex(SLUG),
  kind: z.enum(EXPECTATION_KINDS),
  date: calendarDate(),
  how: z.string().nullable().default(null),
  in_writing: z.boolean().default(false),
  text: z.string().default(""),
  link: z.string().url().nullable().default(null),
  captured: calendarDate(),
}).refine((e) => e.kind === "wellbeing_raised" ? e.text.trim() === "" : e.text.trim() !== "", {
  message: "text is required, except for wellbeing_raised, which records only the date and must have no text",
  path: ["text"],
});
export type ExpectationItem = z.infer<typeof ExpectationItem>;

export const HIRING_DOC_KINDS = ["loop-plan", "question-bank", "scorecard-template", "debrief-agenda", "funnel"] as const;
export type HiringDocKind = (typeof HIRING_DOC_KINDS)[number];

// One written scorecard or note about a candidate, in the interviewer's or EM's words.
// There is no score or decision field on purpose: em-tools never scores or ranks candidates.
export const CandidateNote = z.object({
  id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/),
  candidate: z.string().regex(SLUG),
  kind: z.enum(["scorecard", "note"]),
  stage: z.string().min(1),
  interviewer: z.string().nullable().default(null),
  date: calendarDate(),
  text: z.string().min(1),
  captured: calendarDate(),
}).strict();
export type CandidateNote = z.infer<typeof CandidateNote>;

export interface PersonDoc {
  slug: string;
  frontmatter: Record<string, unknown>;
  title: string;
  sections: Record<Section, string>;
  // Sections em-tools does not manage (including Expectations), kept in order so writes never drop them.
  extra: Array<{ heading: string; content: string }>;
  evidence: EvidenceItem[];
  invalidEvidence: string[];
}

export class NotesError extends Error {}

export function checkSlug(slug: string): string {
  if (!SLUG.test(slug)) throw new NotesError(`"${slug}" is not a valid person slug (lowercase letters, digits and hyphens).`);
  return slug;
}

function personPath(folder: string, slug: string): string {
  return join(folder, "people", `${checkSlug(slug)}.md`);
}

function expectationsPath(folder: string, slug: string): string {
  return join(folder, "people", `${checkSlug(slug)}.expectations.md`);
}

function parseExpectations(text: string): { items: ExpectationItem[]; invalid: string[] } {
  const items: ExpectationItem[] = [];
  const invalid: string[] = [];
  for (const m of text.matchAll(fenced("expectation"))) {
    try {
      const parsed = ExpectationItem.safeParse(YAML.parse(m[1]));
      if (parsed.success) items.push(parsed.data);
      else invalid.push(m[1].trim().split("\n")[0]);
    } catch {
      invalid.push(m[1].trim().split("\n")[0]);
    }
  }
  return { items, invalid };
}

function parseCandidateNotes(text: string): { items: CandidateNote[]; invalid: string[] } {
  const items: CandidateNote[] = [];
  const invalid: string[] = [];
  for (const m of text.matchAll(fenced("candidate-note"))) {
    try {
      const parsed = CandidateNote.safeParse(YAML.parse(m[1]));
      if (parsed.success) items.push(parsed.data);
      else invalid.push(m[1].trim().split("\n")[0]);
    } catch {
      invalid.push(m[1].trim().split("\n")[0]);
    }
  }
  return { items, invalid };
}

export function expectationBlock(item: ExpectationItem): string {
  return "```yaml expectation\n" + YAML.stringify(item) + "```";
}

export interface ExpectationGap {
  kind: "no_written_follow_up" | "no_support_recorded" | "no_change_recorded" | "no_hr_contact_recorded";
  expectation_id?: string;
  since?: string;
  detail: string;
}

function addDays(date: string, days: number): string {
  return new Date(Date.parse(date + "T00:00:00Z") + days * 86_400_000).toISOString().slice(0, 10);
}

// Missing steps in the record. Facts only: never a risk score or a recommendation.
export function expectationGaps(items: ExpectationItem[], now: string, followUpDays = 7, progressDays = 30): ExpectationGap[] {
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
  const expectations = sorted.filter((e) => e.kind === "expectation");
  if (!expectations.length) return [];
  const gaps: ExpectationGap[] = [];
  for (const e of expectations) {
    if (e.in_writing) continue;
    const deadline = addDays(e.date, followUpDays);
    const written = sorted.some((f) => f.kind === "follow_up" && f.in_writing && f.date >= e.date && f.date <= deadline);
    if (!written) gaps.push({ kind: "no_written_follow_up", expectation_id: e.id, since: e.date, detail: `Expectation set on ${e.date} has no written follow-up within ${followUpDays} days.` });
  }
  const first = expectations[0].date;
  if (!sorted.some((x) => x.kind === "support" && x.date >= first)) {
    gaps.push({ kind: "no_support_recorded", since: first, detail: `No support recorded since the first expectation on ${first}.` });
  }
  const latest = expectations[expectations.length - 1].date;
  const progress = sorted.filter((x) => x.kind === "progress" && x.date >= latest);
  const lastSeen = progress.length ? progress[progress.length - 1].date : latest;
  if (addDays(lastSeen, progressDays) < now) {
    gaps.push({ kind: "no_change_recorded", since: lastSeen, detail: `No change recorded for more than ${progressDays} days, since ${lastSeen}.` });
  }
  if (!sorted.some((x) => x.kind === "hr")) {
    gaps.push({ kind: "no_hr_contact_recorded", detail: "No HR contact recorded. Check your local policy on when to involve HR." });
  }
  return gaps;
}

export function parsePerson(slug: string, text: string): PersonDoc {
  const fm = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  const frontmatter = fm ? (YAML.parse(fm[1]) ?? {}) : {};
  const body = fm ? text.slice(fm[0].length) : text;
  const titleMatch = /^# (.+)$/m.exec(body);
  const sections = Object.fromEntries(SECTIONS.map((s) => [s, ""])) as Record<Section, string>;
  const extra: Array<{ heading: string; content: string }> = [];
  const parts = body.split(/^## /m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf("\n");
    const heading = (nl === -1 ? part : part.slice(0, nl)).trim();
    const content = nl === -1 ? "" : part.slice(nl + 1).trim();
    const match = SECTIONS.find((s) => s.toLowerCase() === heading.toLowerCase());
    if (match) sections[match] = content;
    else extra.push({ heading, content });
  }
  const evidence: EvidenceItem[] = [];
  const invalidEvidence: string[] = [];
  for (const m of sections.Evidence.matchAll(fenced("evidence"))) {
    try {
      const parsed = EvidenceItem.safeParse(YAML.parse(m[1]));
      if (parsed.success) evidence.push(parsed.data);
      else invalidEvidence.push(m[1].trim().split("\n")[0]);
    } catch {
      invalidEvidence.push(m[1].trim().split("\n")[0]);
    }
  }
  return { slug, frontmatter, title: titleMatch?.[1] ?? String(frontmatter.name ?? slug), sections, extra, evidence, invalidEvidence };
}

export function renderPerson(doc: PersonDoc): string {
  const fm = YAML.stringify(doc.frontmatter).trimEnd();
  const out = [`---\n${fm}\n---`, `# ${doc.title}`];
  for (const s of SECTIONS) out.push(`## ${s}\n\n${doc.sections[s].trim()}`.trimEnd());
  for (const x of doc.extra) out.push(`## ${x.heading}\n\n${x.content.trim()}`.trimEnd());
  return out.join("\n\n") + "\n";
}

export function evidenceBlock(item: EvidenceItem): string {
  return "```yaml evidence\n" + YAML.stringify(item) + "```";
}

// Write via a temp file and keep the previous version as <file>.bak. Never deletes.
function safeWrite(path: string, content: string): void {
  if (existsSync(path)) copyFileSync(path, path + ".bak");
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, content, "utf8");
  renameSync(tmp, path);
}

export class Notes {
  private folder: string;

  constructor(folder: string) {
    this.folder = folder;
  }

  listPeople(team?: string): Array<Record<string, unknown>> {
    const people: Array<Record<string, unknown>> = [];
    const dir = join(this.folder, "people");
    if (!existsSync(dir)) return [];
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".md") && !x.endsWith(".expectations.md")).sort()) {
      const slug = f.slice(0, -3);
      try {
        people.push({ ...parsePerson(slug, readFileSync(join(dir, f), "utf8")).frontmatter, slug });
      } catch (err) {
        people.push({ slug, error: `could not parse: ${(err as Error).message}` });
      }
    }
    return people.filter((p) => !team || p.team === team);
  }

  readPerson(slug: string): PersonDoc {
    const path = personPath(this.folder, slug);
    if (!existsSync(path)) throw new NotesError(`No notes for "${slug}". Create them with notes_create_person.`);
    return parsePerson(slug, readFileSync(path, "utf8"));
  }

  createPerson(slug: string, frontmatter: Record<string, unknown>): string {
    const path = personPath(this.folder, slug);
    if (existsSync(path)) throw new NotesError(`Notes for "${slug}" already exist. em-tools never overwrites a person file.`);
    mkdirSync(join(this.folder, "people"), { recursive: true });
    const doc: PersonDoc = {
      slug,
      frontmatter: { ...frontmatter, slug },
      title: String(frontmatter.name ?? slug),
      sections: { Log: "", "Open threads": "", Actions: "", Evidence: "" },
      extra: [],
      evidence: [],
      invalidEvidence: [],
    };
    safeWrite(path, renderPerson(doc));
    return path;
  }

  appendEntry(slug: string, section: Exclude<Section, "Evidence">, text: string): string {
    const doc = this.readPerson(slug);
    const entry = text.trim();
    if (!entry) throw new NotesError("Entry text is empty.");
    const current = doc.sections[section].trim();
    // The log is newest first; threads and actions are appended in order.
    doc.sections[section] = section === "Log" ? [entry, current].filter(Boolean).join("\n\n") : [current, entry].filter(Boolean).join("\n");
    const path = personPath(this.folder, slug);
    safeWrite(path, renderPerson(doc));
    return path;
  }

  addEvidence(input: unknown): { path: string; added: boolean } {
    const item = EvidenceItem.parse(input);
    const doc = this.readPerson(item.person);
    if (doc.evidence.some((e) => e.id === item.id)) return { path: personPath(this.folder, item.person), added: false };
    doc.sections.Evidence = [doc.sections.Evidence.trim(), evidenceBlock(item)].filter(Boolean).join("\n\n");
    const path = personPath(this.folder, item.person);
    safeWrite(path, renderPerson(doc));
    return { path, added: true };
  }

  updateFrontmatter(slug: string, fields: Record<string, unknown>): string {
    const doc = this.readPerson(slug);
    if ("slug" in fields && fields.slug !== slug) throw new NotesError("The slug cannot be changed.");
    doc.frontmatter = { ...doc.frontmatter, ...fields };
    const path = personPath(this.folder, slug);
    safeWrite(path, renderPerson(doc));
    return path;
  }

  listEvidence(slug: string, from?: string, to?: string, competency?: string): EvidenceItem[] {
    return this.readPerson(slug).evidence
      .filter((e) => (!from || e.date >= from) && (!to || e.date <= to) && (!competency || e.competency === competency))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  readTeam(): { team: Record<string, unknown>; teamText: string; ladder: string | null } {
    const teamPath = join(this.folder, "team.md");
    if (!existsSync(teamPath)) throw new NotesError("No team.md in the notes folder. The skills can create one from what you tell them.");
    const teamText = readFileSync(teamPath, "utf8");
    const fm = /^---\n([\s\S]*?)\n---/.exec(teamText);
    const team = fm ? (YAML.parse(fm[1]) ?? {}) : {};
    const ladderName = typeof team.ladder === "string" ? team.ladder : "ladder.md";
    const ladderPath = join(this.folder, ladderName);
    if (!ladderPath.startsWith(this.folder)) throw new NotesError("The ladder path must be inside the notes folder.");
    return { team, teamText, ladder: existsSync(ladderPath) ? readFileSync(ladderPath, "utf8") : null };
  }

  expectationsStorage(): StorageMode | null {
    const { team } = this.readTeam();
    const v = team.expectations_storage;
    return (STORAGE_MODES as readonly string[]).includes(v as string) ? (v as StorageMode) : null;
  }

  // Only changes the team.md frontmatter. Never moves or deletes existing records.
  setExpectationsStorage(mode: StorageMode): string {
    if (!(STORAGE_MODES as readonly string[]).includes(mode)) throw new NotesError(`Storage must be one of: ${STORAGE_MODES.join(", ")}.`);
    const { team, teamText } = this.readTeam();
    const fm = /^---\n([\s\S]*?)\n---\n?/.exec(teamText);
    const body = fm ? teamText.slice(fm[0].length) : teamText;
    const path = join(this.folder, "team.md");
    safeWrite(path, `---\n${YAML.stringify({ ...team, expectations_storage: mode }).trimEnd()}\n---\n${body}`);
    return path;
  }

  listExpectations(slug: string, now?: string): {
    storage: StorageMode | null; items: ExpectationItem[]; invalid: string[];
    found_in: { person_file: number; separate_file: number }; gaps: ExpectationGap[];
  } {
    const doc = this.readPerson(slug);
    const inPerson = parseExpectations(doc.extra.find((x) => x.heading.toLowerCase() === EXPECTATIONS_HEADING.toLowerCase())?.content ?? "");
    const sep = expectationsPath(this.folder, slug);
    const inSeparate = existsSync(sep) ? parseExpectations(readFileSync(sep, "utf8")) : { items: [], invalid: [] };
    const byId = new Map<string, ExpectationItem>();
    for (const e of [...inPerson.items, ...inSeparate.items]) if (!byId.has(e.id)) byId.set(e.id, e);
    const items = [...byId.values()].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    return {
      storage: this.expectationsStorage(),
      items,
      invalid: [...inPerson.invalid, ...inSeparate.invalid],
      found_in: { person_file: inPerson.items.length, separate_file: inSeparate.items.length },
      gaps: expectationGaps(items, now ?? new Date().toISOString().slice(0, 10)),
    };
  }

  // Append-only. Skips duplicates by id across both storage places.
  addExpectation(input: unknown): { path: string; added: boolean; storage: StorageMode } {
    const item = ExpectationItem.parse(input);
    const storage = this.expectationsStorage();
    if (!storage) throw new NotesError("No expectations_storage in team.md. Ask the EM where records go (person-file or separate-file), then call notes_set_expectations_storage.");
    const doc = this.readPerson(item.person);
    const existing = this.listExpectations(item.person, item.captured).items;
    if (storage === "person-file") {
      const path = personPath(this.folder, item.person);
      if (existing.some((e) => e.id === item.id)) return { path, added: false, storage };
      let section = doc.extra.find((x) => x.heading.toLowerCase() === EXPECTATIONS_HEADING.toLowerCase());
      if (!section) doc.extra.push((section = { heading: EXPECTATIONS_HEADING, content: "" }));
      section.content = [section.content.trim(), expectationBlock(item)].filter(Boolean).join("\n\n");
      safeWrite(path, renderPerson(doc));
      return { path, added: true, storage };
    }
    const path = expectationsPath(this.folder, item.person);
    if (existing.some((e) => e.id === item.id)) return { path, added: false, storage };
    const current = existsSync(path)
      ? readFileSync(path, "utf8").trimEnd()
      : `---\nperson: ${item.person}\nrecord: expectations\n---\n\n# ${doc.title}: expectations record\n\nAppend-only. Facts and dates in the EM's words. Not a verdict.\n\n## ${EXPECTATIONS_HEADING}`;
    safeWrite(path, `${current}\n\n${expectationBlock(item)}\n`);
    return { path, added: true, storage };
  }

  private hiringDir(role: string): string {
    if (!SLUG.test(role)) throw new NotesError(`"${role}" is not a valid role slug (lowercase letters, digits and hyphens).`);
    return join(this.folder, "hiring", role);
  }

  // Never overwrites: a second save of the same kind and date gets a suffix.
  saveHiringDoc(role: string, kind: HiringDocKind, date: string, content: string): string {
    if (!(HIRING_DOC_KINDS as readonly string[]).includes(kind)) throw new NotesError(`Kind must be one of: ${HIRING_DOC_KINDS.join(", ")}.`);
    if (!calendarDate().safeParse(date).success) throw new NotesError("Date must be a real YYYY-MM-DD date.");
    if (!content.trim()) throw new NotesError("Content is empty.");
    const dir = this.hiringDir(role);
    mkdirSync(dir, { recursive: true });
    let path = join(dir, `${date}-${kind}.md`);
    for (let n = 2; existsSync(path); n++) path = join(dir, `${date}-${kind}-${n}.md`);
    writeFileSync(path, content.endsWith("\n") ? content : content + "\n", "utf8");
    return path;
  }

  // Append-only, one file per candidate. Skips duplicate ids. Keeps a .bak.
  addCandidateNote(role: string, input: unknown): { path: string; added: boolean } {
    const item = CandidateNote.parse(input);
    const dir = join(this.hiringDir(role), "candidates");
    const path = join(dir, `${item.candidate}.md`);
    const current = existsSync(path) ? readFileSync(path, "utf8") : null;
    if (current && parseCandidateNotes(current).items.some((x) => x.id === item.id)) return { path, added: false };
    mkdirSync(dir, { recursive: true });
    const head = current?.trimEnd() ?? `---\ncandidate: ${item.candidate}\nrole: ${role}\n---\n\n# ${item.candidate}: ${role}\n\nAppend-only. Written scorecards and notes in the writer's own words. Follow your organisation's retention policy for candidate data; em-tools never deletes files.\n\n## Notes`;
    safeWrite(path, `${head}\n\n\`\`\`yaml candidate-note\n${YAML.stringify(item)}\`\`\`\n`);
    return { path, added: true };
  }

  readCandidate(role: string, candidate: string): { candidate: string; items: CandidateNote[]; invalid: string[] } {
    if (!SLUG.test(candidate)) throw new NotesError(`"${candidate}" is not a valid candidate slug.`);
    const path = join(this.hiringDir(role), "candidates", `${candidate}.md`);
    if (!existsSync(path)) throw new NotesError(`No notes for candidate "${candidate}" in role "${role}".`);
    const { items, invalid } = parseCandidateNotes(readFileSync(path, "utf8"));
    return { candidate, items: items.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)), invalid };
  }

  readHiringDoc(role: string, file: string): { file: string; content: string } {
    // Only a plain file name directly in the role folder, never a path.
    if (!/^[a-z0-9][a-z0-9-]*\.md$/.test(file)) throw new NotesError(`"${file}" is not a hiring document name.`);
    const path = join(this.hiringDir(role), file);
    if (!existsSync(path)) throw new NotesError(`No hiring document "${file}" for role "${role}".`);
    return { file, content: readFileSync(path, "utf8") };
  }

  // What exists for a role, without any scores: documents, and per candidate the stages
  // with a written scorecard and who has written one.
  listHiring(role: string): {
    role: string; docs: string[];
    candidates: Array<{ candidate: string; notes: number; scorecards: Array<{ stage: string; interviewer: string | null; date: string }> }>;
  } {
    const dir = this.hiringDir(role);
    if (!existsSync(dir)) return { role, docs: [], candidates: [] };
    // Sort without the extension so "<date>-<kind>.md" comes before its "-2" revision.
    const stem = (f: string) => f.slice(0, -3);
    const docs = readdirSync(dir).filter((f) => f.endsWith(".md")).sort((a, b) => stem(a).localeCompare(stem(b)));
    const cdir = join(dir, "candidates");
    const candidates = existsSync(cdir)
      ? readdirSync(cdir).filter((f) => f.endsWith(".md")).sort().map((f) => {
          const { items } = parseCandidateNotes(readFileSync(join(cdir, f), "utf8"));
          return {
            candidate: f.slice(0, -3),
            notes: items.length,
            scorecards: items.filter((x) => x.kind === "scorecard").map((x) => ({ stage: x.stage, interviewer: x.interviewer, date: x.date })),
          };
        })
      : [];
    return { role, docs, candidates };
  }

  saveDraft(skill: string, date: string, content: string): string {
    if (!/^[a-z0-9-]{1,40}$/.test(skill)) throw new NotesError("Skill name must be lowercase letters, digits and hyphens.");
    if (!ISO_DATE.test(date)) throw new NotesError("Date must be YYYY-MM-DD.");
    const dir = join(this.folder, "drafts");
    mkdirSync(dir, { recursive: true });
    let path = join(dir, `${date}-${skill}.md`);
    for (let n = 2; existsSync(path); n++) path = join(dir, `${date}-${skill}-${n}.md`);
    writeFileSync(path, content, "utf8");
    return path;
  }
}
