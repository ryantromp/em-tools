import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
import { z } from "zod";

export const SECTIONS = ["Log", "Open threads", "Actions", "Evidence"] as const;
export type Section = (typeof SECTIONS)[number];

const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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

export interface PersonDoc {
  slug: string;
  frontmatter: Record<string, unknown>;
  title: string;
  sections: Record<Section, string>;
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

export function parsePerson(slug: string, text: string): PersonDoc {
  const fm = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  const frontmatter = fm ? (YAML.parse(fm[1]) ?? {}) : {};
  const body = fm ? text.slice(fm[0].length) : text;
  const titleMatch = /^# (.+)$/m.exec(body);
  const sections = Object.fromEntries(SECTIONS.map((s) => [s, ""])) as Record<Section, string>;
  const parts = body.split(/^## /m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf("\n");
    const heading = (nl === -1 ? part : part.slice(0, nl)).trim();
    const content = nl === -1 ? "" : part.slice(nl + 1).trim();
    const match = SECTIONS.find((s) => s.toLowerCase() === heading.toLowerCase());
    if (match) sections[match] = content;
  }
  const evidence: EvidenceItem[] = [];
  const invalidEvidence: string[] = [];
  for (const m of sections.Evidence.matchAll(/```yaml evidence\n([\s\S]*?)```/g)) {
    try {
      const parsed = EvidenceItem.safeParse(YAML.parse(m[1]));
      if (parsed.success) evidence.push(parsed.data);
      else invalidEvidence.push(m[1].trim().split("\n")[0]);
    } catch {
      invalidEvidence.push(m[1].trim().split("\n")[0]);
    }
  }
  return { slug, frontmatter, title: titleMatch?.[1] ?? String(frontmatter.name ?? slug), sections, evidence, invalidEvidence };
}

export function renderPerson(doc: PersonDoc): string {
  const fm = YAML.stringify(doc.frontmatter).trimEnd();
  const out = [`---\n${fm}\n---`, `# ${doc.title}`];
  for (const s of SECTIONS) out.push(`## ${s}\n\n${doc.sections[s].trim()}`.trimEnd());
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
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".md")).sort()) {
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
