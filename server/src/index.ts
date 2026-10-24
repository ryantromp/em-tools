import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadConfig } from "./config.ts";
import { loadRows } from "./csv.ts";
import { actionAge, aiAdoption, dependencyAge, dora, meetingLoad, oncallHealth, prFlow, MIN_GROUP_SIZE } from "./metrics.ts";
import { Notes, NotesError } from "./notes.ts";

const VERSION = "0.1.0";
const config = loadConfig();
const server = new McpServer({ name: "em-tools", version: VERSION });

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function fail(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

function notes(): Notes {
  if (!config.notesFolder) throw new NotesError(config.notesProblem ?? "Notes folder is not available.");
  return new Notes(config.notesFolder);
}

async function guarded<T>(fn: () => T | Promise<T>) {
  try {
    return ok(await fn());
  } catch (err) {
    if (err instanceof NotesError || err instanceof z.ZodError) return fail(err.message);
    return fail(`em-tools server error: ${(err as Error).message}`);
  }
}

const rows = z.array(z.record(z.string(), z.unknown())).optional().describe("Rows as JSON objects. Use this or csv_path.");
const csvPath = z.string().optional().describe("Path to a local CSV or JSON export. Use this or rows.");
const window = {
  from: z.string().optional().describe("Start date, YYYY-MM-DD, inclusive."),
  to: z.string().optional().describe("End date, YYYY-MM-DD, inclusive."),
};

// Notes ---------------------------------------------------------------------

server.registerTool("notes_status", {
  description: "Check em-tools setup: notes folder, locale, number of people. Call this first in every skill.",
  inputSchema: {},
}, async () => guarded(() => ({
  version: VERSION,
  notes_folder: config.notesFolder,
  notes_problem: config.notesProblem,
  locale: config.locale,
  locale_problem: config.localeProblem,
  people: config.notesFolder ? new Notes(config.notesFolder).listPeople().length : 0,
  min_group_size: MIN_GROUP_SIZE,
})));

server.registerTool("notes_list_people", {
  description: "List people in the notes folder with their frontmatter (role, level, team, cadence). Optionally filter by team.",
  inputSchema: { team: z.string().optional() },
}, async ({ team }) => guarded(() => notes().listPeople(team)));

server.registerTool("notes_read_person", {
  description: "Read one person's notes: frontmatter, log, open threads, actions and parsed evidence items.",
  inputSchema: { slug: z.string() },
}, async ({ slug }) => guarded(() => notes().readPerson(slug)));

server.registerTool("notes_create_person", {
  description: "Create a new person file. Fails if the person already exists; never overwrites.",
  inputSchema: { slug: z.string(), frontmatter: z.record(z.string(), z.unknown()) },
}, async ({ slug, frontmatter }) => guarded(() => ({ path: notes().createPerson(slug, frontmatter) })));

server.registerTool("notes_append_entry", {
  description: "Append to a person's Log (newest first), Open threads or Actions. Only call after the EM confirms the text. Keeps a .bak of the previous file.",
  inputSchema: { slug: z.string(), section: z.enum(["Log", "Open threads", "Actions"]), text: z.string() },
}, async ({ slug, section, text }) => guarded(() => ({ path: notes().appendEntry(slug, section, text) })));

server.registerTool("notes_add_evidence", {
  description: "Add one evidence item (source, date, link, situation, behaviour, impact) to a person's Evidence section. Skips duplicates by id. Only call after the EM confirms.",
  inputSchema: {
    item: z.object({
      id: z.string(), person: z.string(),
      source: z.enum(["note", "github", "linear", "jira", "slack", "teams", "calendar", "manual"]),
      date: z.string(), link: z.string().nullable(),
      situation: z.string(), behaviour: z.string(), impact: z.string(),
      competency: z.string().nullable().optional(), captured: z.string(),
    }),
  },
}, async ({ item }) => guarded(() => notes().addEvidence(item)));

server.registerTool("notes_update_frontmatter", {
  description: "Merge fields into a person's frontmatter (for example career_goals or next_one_on_one). Cannot change the slug. Keeps a .bak.",
  inputSchema: { slug: z.string(), fields: z.record(z.string(), z.unknown()) },
}, async ({ slug, fields }) => guarded(() => ({ path: notes().updateFrontmatter(slug, fields) })));

server.registerTool("notes_list_evidence", {
  description: "List a person's evidence items, oldest first, optionally filtered by date range or competency.",
  inputSchema: { slug: z.string(), ...window, competency: z.string().optional() },
}, async ({ slug, from, to, competency }) => guarded(() => notes().listEvidence(slug, from, to, competency)));

server.registerTool("notes_read_team", {
  description: "Read team.md (members, sub-teams, 1:1 cadence, channels, ladder path) and the career ladder if present.",
  inputSchema: {},
}, async () => guarded(() => notes().readTeam()));

server.registerTool("notes_set_expectations_storage", {
  description: "Save where underperformance records go, as expectations_storage in team.md: person-file (an Expectations section in people/<slug>.md) or separate-file (people/<slug>.expectations.md). Only call after the EM chooses. Never moves or deletes existing records. Keeps a .bak.",
  inputSchema: { storage: z.enum(["person-file", "separate-file"]) },
}, async ({ storage }) => guarded(() => ({ path: notes().setExpectationsStorage(storage) })));

server.registerTool("notes_add_expectation", {
  description: "Append one dated record to a person's expectations record, in the place set by expectations_storage. Kinds: expectation, support, progress (change seen), follow_up, hr, wellbeing_raised (date only, no text). Append-only, skips duplicate ids, keeps a .bak. Only call after the EM confirms the exact text.",
  inputSchema: {
    item: z.object({
      id: z.string(), person: z.string(),
      kind: z.enum(["expectation", "support", "progress", "follow_up", "hr", "wellbeing_raised"]),
      date: z.string(), how: z.string().nullable().optional(), in_writing: z.boolean().optional(),
      text: z.string().optional(), link: z.string().nullable().optional(), captured: z.string(),
    }),
  },
}, async ({ item }) => guarded(() => notes().addExpectation(item)));

server.registerTool("notes_list_expectations", {
  description: "Read a person's expectations record from both storage places, oldest first, with the storage setting and a gaps list (no written follow-up within 7 days, no support recorded, no change recorded for 30 days, no HR contact recorded). Facts only; never a score.",
  inputSchema: { slug: z.string(), now: z.string().optional() },
}, async ({ slug, now }) => guarded(() => notes().listExpectations(slug, now)));

server.registerTool("notes_save_draft", {
  description: "Save a skill's output as a dated draft in the notes folder's drafts/ folder. Never overwrites; adds a suffix instead.",
  inputSchema: { skill: z.string(), date: z.string(), content: z.string() },
}, async ({ skill, date, content }) => guarded(() => ({ path: notes().saveDraft(skill, date, content) })));

// Metrics -------------------------------------------------------------------

server.registerTool("metrics_pr_flow", {
  description: "Team PR flow: pickup, review and cycle time (median, p75), PR size bands, weekly trend, PRs waiting for first review. Columns: number, title, author, created_at, first_review_at, merged_at, closed_at, additions, deletions, is_draft. Authors are never reported.",
  inputSchema: { rows, csv_path: csvPath, ...window, now: z.string().optional() },
}, async (a) => guarded(() => prFlow(loadRows(a.rows, a.csv_path), { from: a.from, to: a.to, now: a.now })));

server.registerTool("metrics_dora", {
  description: "Team DORA metrics: deployment frequency, change lead time, and change fail rate, recovery time and rework rate as labelled proxies. Deploy columns: id, deployed_at, environment, status. PR columns: number, title, labels, created_at, first_commit_at, merged_at. Optional incidents with started_at.",
  inputSchema: {
    deploy_rows: rows, deploy_csv_path: csvPath, pr_rows: rows, pr_csv_path: csvPath,
    incident_rows: rows, incident_csv_path: csvPath, ...window,
    failure_window_hours: z.number().optional(),
  },
}, async (a) => guarded(() => dora(loadRows(a.deploy_rows, a.deploy_csv_path), loadRows(a.pr_rows, a.pr_csv_path), {
  from: a.from, to: a.to, failureWindowHours: a.failure_window_hours, incidents: loadRows(a.incident_rows, a.incident_csv_path),
})));

server.registerTool("metrics_meeting_load", {
  description: "Team meeting load: meeting hours per person per week (team average), share of days with a 2-hour focus block, after-hours meetings, top recurring meetings. Event columns: start, end, title, attendees (semicolon separated emails), recurring.",
  inputSchema: {
    rows, csv_path: csvPath, members: z.array(z.string()).describe("Team member emails."),
    from: z.string(), to: z.string(),
    workday_start_hour: z.number().optional(), workday_end_hour: z.number().optional(),
    timezone_offset_minutes: z.number().optional(),
  },
}, async (a) => guarded(() => meetingLoad(loadRows(a.rows, a.csv_path), a.members, {
  from: a.from, to: a.to, workdayStartHour: a.workday_start_hour, workdayEndHour: a.workday_end_hour, timezoneOffsetMinutes: a.timezone_offset_minutes,
})));

server.registerTool("metrics_dependency_age", {
  description: "Cross-team dependency register maths: age in working days, aging and stale counts, counts by other team, and the blocked share of cycle time for finished work. Dependency columns: id, title, direction (we_wait or they_wait), other_team, since, resolved_at, link. Finished-work columns: started_at, completed_at, blocked_days. Owners are never reported.",
  inputSchema: {
    rows, csv_path: csvPath, finished_rows: rows, finished_csv_path: csvPath,
    now: z.string().optional(), aging_days: z.number().optional(), stale_days: z.number().optional(),
  },
}, async (a) => guarded(() => dependencyAge(loadRows(a.rows, a.csv_path), {
  now: a.now, agingDays: a.aging_days, staleDays: a.stale_days, finished: loadRows(a.finished_rows, a.finished_csv_path),
})));

server.registerTool("metrics_oncall", {
  description: `On-call health per rotation: pages per week, off-hours share, incidents per 12 on-call hours, 12-hour windows with more than 2 incidents, time to acknowledge, average share of time on call, top noisy alerts. Rotations under ${MIN_GROUP_SIZE} people show totals only. Page columns: rotation, created_at, acknowledged_at, alert (or title), actionable. Shift columns: rotation, start, end, member (counted only). Never returns people or shift dates.`,
  inputSchema: {
    page_rows: rows, page_csv_path: csvPath, shift_rows: rows, shift_csv_path: csvPath, ...window,
    time_zone: z.string().optional().describe("IANA time zone such as Europe/London; handles daylight saving. Preferred over timezone_offset_minutes."),
    timezone_offset_minutes: z.number().optional(), workday_start_hour: z.number().optional(), workday_end_hour: z.number().optional(),
  },
}, async (a) => guarded(() => oncallHealth(loadRows(a.page_rows, a.page_csv_path), loadRows(a.shift_rows, a.shift_csv_path), {
  from: a.from, to: a.to, timeZone: a.time_zone, timezoneOffsetMinutes: a.timezone_offset_minutes, workdayStartHour: a.workday_start_hour, workdayEndHour: a.workday_end_hour,
})));

server.registerTool("metrics_action_age", {
  description: "Postmortem action ages across incidents: open and closed counts, open actions by age band, overdue, no due date, median days to close, counts by month created and by incident, and the open list. Columns: id, incident, title, owner_role, created_at, due, completed_at, link. Owner name columns are ignored; only owner_role is returned.",
  inputSchema: { rows, csv_path: csvPath, now: z.string().optional() },
}, async (a) => guarded(() => actionAge(loadRows(a.rows, a.csv_path), { now: a.now })));

server.registerTool("metrics_ai_adoption", {
  description: `Team AI adoption, ROI and quality aggregates. Groups under ${MIN_GROUP_SIZE} people (or whose complement is under ${MIN_GROUP_SIZE}) are suppressed. Usage columns: person, date, tool, active. PR columns: number, author, created_at, merged_at, additions, deletions, review_comments, ai_assisted, reverted, defect_linked, churn_lines_21d. Spend columns: month, tool, amount, currency. Never returns per-person rows.`,
  inputSchema: {
    groups: z.record(z.string(), z.array(z.string())).describe("Group name to member ids (the ids used in usage and PR rows). Include the whole team as one group."),
    usage_rows: rows, usage_csv_path: csvPath, pr_rows: rows, pr_csv_path: csvPath, spend_rows: rows, spend_csv_path: csvPath,
    ...window,
  },
}, async (a) => guarded(() => aiAdoption({
  groups: a.groups,
  usage: loadRows(a.usage_rows, a.usage_csv_path),
  prs: loadRows(a.pr_rows, a.pr_csv_path),
  spend: loadRows(a.spend_rows, a.spend_csv_path),
  from: a.from, to: a.to,
})));

const major = Number(process.versions.node.split(".")[0]);
if (major < 20) {
  process.stderr.write(`em-tools server needs Node 20 or later; found ${process.versions.node}. Skills still work in paste-in mode.\n`);
  process.exit(1);
}
await server.connect(new StdioServerTransport());
