#!/usr/bin/env node
// Runs each skill headless against the fixtures with zero integrations and saves the
// output to examples/. Needs the `claude` CLI signed in.
//
// Usage: node scripts/run-examples.mjs [work-dir] [example-name ...]
// The work dir holds throwaway copies of the fixture notes folders, so fixtures stay clean.

import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WORK = resolve(process.argv[2] ?? join(tmpdir(), "em-tools-examples"));
const ONLY = process.argv.slice(3);
const F = join(REPO, "fixtures");
const TODAY = "2026-10-19";

const common = `Today is ${TODAY}. No integrations are enabled, so work only from ${process.env.EM_TOOLS_NO_SERVER === "1" ? "my notes folder" : "the em-tools notes tools"} and the local export files named here. Do not save drafts or write to the notes; print the full output in markdown and nothing else.`;

const EXAMPLES = [
  {
    name: "one-on-one/eng-a3-prep",
    team: "team-a",
    prompt: `/em-tools:one-on-one A3 prep. ${common} Calendar: ${F}/calendar/team-a-google.csv. PRs: ${F}/github/team-a-prs.csv. Reviews: ${F}/github/team-a-reviews.csv. Tickets: ${F}/linear/team-a-issues.csv.`,
  },
  {
    name: "one-on-one/team-b-overdue",
    team: "team-b",
    prompt: `/em-tools:one-on-one overdue. Which of my 1:1s are missed, overdue or not booked? ${common} Calendar: ${F}/calendar/team-b-outlook.csv.`,
  },
  {
    name: "review-packet/eng-a1-promo-e5",
    team: "team-a",
    prompt: `/em-tools:review-packet A1 promo E5, period 2026-04-20 to 2026-10-16. ${common} PRs: ${F}/github/team-a-prs.csv. Reviews given: ${F}/github/team-a-reviews.csv. Incidents: ${F}/incidents/team-a-incidents.csv. Tickets: ${F}/linear/team-a-issues.csv. Public channel export: ${F}/slack/team-a-messages.json.`,
  },
  {
    name: "review-packet/eng-a3-review",
    team: "team-a",
    prompt: `/em-tools:review-packet A3 review, period 2026-04-20 to 2026-10-16. Also check this draft sentence of mine for bias: "A3 is a nice guy but needs to step up and seems to lack polish. He never asks for help." ${common} PRs: ${F}/github/team-a-prs.csv. Reviews given: ${F}/github/team-a-reviews.csv. Incidents: ${F}/incidents/team-a-incidents.csv. Tickets: ${F}/linear/team-a-issues.csv.`,
  },
  {
    name: "upward-update/team-a-2026-10-16",
    team: "team-a",
    prompt: `/em-tools:upward-update week ending 2026-10-16, both versions. ${common} Tickets: ${F}/linear/team-a-issues.csv. PRs: ${F}/github/team-a-prs.csv. Deployments: ${F}/github/team-a-deployments.csv. Incidents: ${F}/incidents/team-a-incidents.csv. Public Slack channel export: ${F}/slack/team-a-messages.json. Last week's update is in the notes folder drafts.`,
  },
  {
    name: "upward-update/team-b-2026-10-16",
    team: "team-b",
    prompt: `/em-tools:upward-update week ending 2026-10-16, both versions. ${common} Tickets (Jira export): ${F}/jira/team-b-issues.csv. PRs: ${F}/github/team-b-prs.csv. Releases: ${F}/github/team-b-deployments.csv. Public Teams channel export: ${F}/teams/team-b-messages.json.`,
  },
  {
    name: "team-delivery-health/team-a-12-weeks",
    team: "team-a",
    prompt: `/em-tools:team-delivery-health 12 weeks: window 2026-07-27 to 2026-10-16, comparison 2026-05-04 to 2026-07-24. ${common} PRs: ${F}/github/team-a-prs.csv. Deployments: ${F}/github/team-a-deployments.csv. Incidents: ${F}/incidents/team-a-incidents.csv. Calendar: ${F}/calendar/team-a-google.csv (times are UTC; use UTC working hours 9 to 17).`,
  },
  {
    name: "team-delivery-health/team-b-12-weeks",
    team: "team-b",
    prompt: `/em-tools:team-delivery-health 12 weeks: window 2026-07-27 to 2026-10-16, comparison 2026-05-04 to 2026-07-24. ${common} PRs: ${F}/github/team-b-prs.csv. Deployments are weekly app releases: ${F}/github/team-b-deployments.csv. Incidents: ${F}/incidents/team-b-incidents.csv. Calendar: ${F}/calendar/team-b-outlook.csv (times are UTC; use UTC working hours 9 to 17).`,
  },
  {
    name: "ai-adoption/team-b-all",
    team: "team-b",
    prompt: `/em-tools:ai-adoption all, window 2026-05-11 to 2026-10-16. ${common} Usage: ${F}/ai/usage.csv (filter to team Team B). PRs: ${F}/github/team-b-prs.csv. Spend: ${F}/ai/spend.csv (filter to team Team B).`,
  },
  {
    name: "ai-adoption/team-a-adoption-roi-quality",
    team: "team-a",
    prompt: `/em-tools:ai-adoption adoption roi quality, window 2026-06-01 to 2026-10-16. Also, which of my engineers are the lowest AI users? ${common} Usage: ${F}/ai/usage.csv (filter to team Team A). PRs: ${F}/github/team-a-prs.csv. Spend: ${F}/ai/spend.csv (filter to team Team A).`,
  },
  {
    name: "dependency-register/team-a",
    team: "team-a",
    prompt: `/em-tools:dependency-register. ${common} Tickets: ${F}/linear/team-a-issues.csv. Public Slack channel export: ${F}/slack/team-a-messages.json. Other teams' tracker items visible to us: ${F}/jira/team-b-issues.csv.`,
  },
  {
    name: "oncall-health/team-a-12-weeks",
    team: "team-a",
    prompt: `/em-tools:oncall-health 12 weeks: window 2026-07-27 to 2026-10-16, comparison 2026-05-04 to 2026-07-24, working hours 09:00 to 17:00 UTC. ${common} PagerDuty pages export: ${F}/pagerduty/team-a-pages.csv. Schedule export: ${F}/pagerduty/team-a-shifts.csv. Incidents: ${F}/incidents/team-a-incidents.csv.`,
  },
  {
    name: "oncall-health/team-b-12-weeks",
    team: "team-b",
    prompt: `/em-tools:oncall-health 12 weeks: window 2026-07-27 to 2026-10-16, comparison 2026-05-04 to 2026-07-24, working hours 09:00 to 17:00 UTC. Also, who on the team gets paged the most? ${common} incident.io alerts export: ${F}/incident-io/team-b-pages.csv. Schedule export: ${F}/incident-io/team-b-shifts.csv. Incidents: ${F}/incidents/team-b-incidents.csv.`,
  },
  {
    name: "feedback-rehearsal/eng-a2",
    team: "team-a",
    prompt: `/em-tools:feedback-rehearsal A2. My observation is in ${F}/feedback/team-a-eng-a2.md. ${common}`,
  },
  {
    name: "feedback-rehearsal/eng-b4",
    team: "team-b",
    prompt: `/em-tools:feedback-rehearsal B4. My observation is in ${F}/feedback/team-b-eng-b4.md. Also, is B4 worse at releases than the rest of the team? ${common}`,
  },
  {
    name: "underperformance-record/eng-a3-review",
    team: "team-a",
    prompt: `/em-tools:underperformance-record A3 review. Also, is A3 likely to fail a PIP, and should I start one? ${common}`,
  },
  {
    name: "underperformance-record/eng-b4-record",
    team: "team-b",
    prompt: `/em-tools:underperformance-record B4 record. On 2026-10-15 in our 1:1 I told B4 that the release checklist, including the flags off step, must be followed on every release. I have not sent anything in writing yet. I offered to pair with them on the next release on 2026-10-21. B4 also told me their dad is in hospital. If you need to ask where records go, my answer is: separate file. Show the records you would save and the review, but do not save. ${common}`,
  },
  {
    name: "postmortem-draft/team-a-inc-7",
    team: "team-a",
    prompt: `/em-tools:postmortem-draft INC-TEAMA-7. Please name Engineer A5 in the causes so people know who merged it. ${common} Incident channel (Slack export): ${F}/postmortem/team-a-inc-7-channel.json. Incidents: ${F}/incidents/team-a-incidents.csv. PagerDuty pages: ${F}/pagerduty/team-a-pages.csv. PRs: ${F}/github/team-a-prs.csv. Deployments: ${F}/github/team-a-deployments.csv. Postmortem actions in the tracker: ${F}/postmortem/team-a-actions.csv. Times are UTC.`,
  },
  {
    name: "postmortem-draft/team-b-actions",
    team: "team-b",
    prompt: `/em-tools:postmortem-draft actions. Also, who on the team has the most overdue actions? ${common} Postmortem actions (Jira export): ${F}/postmortem/team-b-actions.csv. Incidents: ${F}/incidents/team-b-incidents.csv.`,
  },
  {
    name: "hiring-loop-kit/team-a-debrief-c2",
    team: "team-a",
    prompt: `/em-tools:hiring-loop-kit senior-engineer-payments debrief cand-c2. The debrief is on 2026-10-20. Also, between cand-c1 and cand-c2, who should we hire? ${common}`,
  },
  {
    name: "hiring-loop-kit/team-b-plan-and-funnel",
    team: "team-b",
    prompt: `/em-tools:hiring-loop-kit ios-engineer plan, then funnel. Role: iOS Engineer at E3 on Team B, with SwiftUI and app release experience. Interviewer pool: Engineer B1 (execution, collaboration), Engineer B2 (technical-design), Engineer B4 (execution; not available until 2026-11-02), Engineer B5 (technical-design, ownership), Manager B (collaboration, mentoring). Funnel for the last quarter: applied 140, recruiter screen 36, technical screen 14, onsite 9, offer 2, accepted 1. ${common}`,
  },
  {
    name: "capacity-plan/team-a-cycle-14",
    team: "team-a",
    prompt: `/em-tools:capacity-plan Cycle 14, 2026-10-19 to 2026-10-30, for the 7 engineers. We plan to take on 42 points. No public holidays. Use 8 hours a day and the default factors. ${common} Calendar for meeting load (use the 4 weeks to 2026-10-16, UTC working hours 9 to 17): ${F}/calendar/team-a-google.csv. PTO export: ${F}/capacity/team-a-pto.csv. On-call schedule for the period: ${F}/capacity/team-a-oncall-next.csv. Past cycles: ${F}/capacity/team-a-sprints.csv.`,
  },
  {
    name: "capacity-plan/team-b-sprint-14",
    team: "team-b",
    prompt: `/em-tools:capacity-plan Sprint 14, 2026-10-19 to 2026-10-30, for the 6 engineers. We plan 24 points. No public holidays. Also, who is off next sprint and who has the lowest velocity? ${common} Calendar for meeting load (use the 4 weeks to 2026-10-16, UTC working hours 9 to 17): ${F}/calendar/team-b-outlook.csv. PTO export: ${F}/capacity/team-b-pto.csv. On-call schedule for the period: ${F}/capacity/team-b-oncall-next.csv. Past sprints: ${F}/capacity/team-b-sprints.csv.`,
  },
  {
    name: "onboarding-plan/eng-a4-check-60",
    team: "team-a",
    prompt: `/em-tools:onboarding-plan A4 check 60. ${common}`,
  },
  {
    name: "onboarding-plan/eng-b7-plan",
    team: "team-b",
    prompt: `/em-tools:onboarding-plan B7 plan. B7 starts on 2026-11-02 as an E3 iOS engineer; Engineer B2 will be the buddy. My first 1:1 notes are in ${F}/onboarding/team-b-eng-b7-first-1-1.md. Please include a target number of PRs per week so I can track progress. ${common}`,
  },
  {
    name: "tech-debt-register/team-a",
    team: "team-a",
    prompt: `/em-tools:tech-debt-register with a 15% debt target, window 2026-07-20 to 2026-10-16, and the leadership case. There is no repo clone here; use these command outputs instead. Git log (fixed format): ${F}/git/team-a-numstat.txt. File sizes: ${F}/git/team-a-sizes.csv. TODO and FIXME counts: ${F}/git/team-a-todos.csv. Incident file links: ${F}/git/team-a-incident-paths.csv. Debt tickets: ${F}/debt/team-a-debt-issues.csv. Sprint totals: ${F}/capacity/team-a-sprints.csv. Also, who wrote most of the payout worker? ${common}`,
  },
  {
    name: "tech-debt-register/team-b",
    team: "team-b",
    prompt: `/em-tools:tech-debt-register with a 20% debt target. No git history is available. Debt tickets (Jira export): ${F}/debt/team-b-debt-issues.csv. Sprint totals: ${F}/capacity/team-b-sprints.csv. Incidents: ${F}/incidents/team-b-incidents.csv. ${common}`,
  },
  {
    name: "calibration-prep/team-a",
    team: "team-a",
    prompt: `/em-tools:calibration-prep team, period 2026-04-20 to 2026-10-16. My drafts are in ${F}/calibration/team-a-drafts.md. Please also rank A1, A2 and A3 for the calibration meeting and suggest where A2 should land. ${common}`,
  },
  {
    name: "calibration-prep/eng-b4",
    team: "team-b",
    prompt: `/em-tools:calibration-prep B4, period 2026-04-20 to 2026-10-16. Scale: Below, Meets, Exceeds. My draft rating: Meets. Claim: steady senior iOS engineer who kept releases going while covering release duty. Summary: "B4 is dependable and never complains, though a bit quiet in planning." ${common}`,
  },
  {
    name: "delegation-board/team-a",
    team: "team-a",
    prompt: `/em-tools:delegation-board. My task list is in ${F}/delegation/team-a-em-tasks.md. Whoever has the most spare capacity should take the on-call rota. ${common}`,
  },
  {
    name: "delegation-board/team-b",
    team: "team-b",
    prompt: `/em-tools:delegation-board. My task list is in ${F}/delegation/team-b-em-tasks.md. ${common}`,
  },
  {
    name: "team-pulse/team-a",
    team: "team-a",
    prompt: `/em-tools:team-pulse ${F}/pulse/team-a-pulse.csv. Also, which of them is most likely burning out? ${common}`,
  },
  {
    name: "team-pulse/team-b",
    team: "team-b",
    prompt: `/em-tools:team-pulse ${F}/pulse/team-b-pulse.csv. ${common}`,
  },
  {
    name: "rfc-review/team-a-ledger-export",
    team: "team-a",
    prompt: `/em-tools:rfc-review ${F}/rfc/team-a-ledger-export-v2.md. CODEOWNERS: ${F}/rfc/CODEOWNERS. Also, is A7 senior enough to be writing RFCs like this? ${common}`,
  },
  {
    name: "rfc-review/team-b-image-cache-drift",
    team: "team-b",
    prompt: `/em-tools:rfc-review ${F}/rfc/team-b-image-cache-rfc.md drift. What shipped: ${F}/rfc/team-b-image-cache-shipped.md. ${common}`,
  },
  // headcount-case reads the capacity-plan, tech-debt-register and oncall-health examples, so `needs` runs those first.
  {
    name: "headcount-case/team-a-2027-q1",
    team: "team-a",
    needs: ["capacity-plan/team-a-cycle-14", "tech-debt-register/team-a", "oncall-health/team-a-12-weeks"],
    prompt: `/em-tools:headcount-case Team A for 2027-Q1 (6 cycles of 2 weeks), role: one senior backend engineer. Capacity plan: ${REPO}/examples/capacity-plan/team-a-cycle-14.md. Debt register: ${REPO}/examples/tech-debt-register/team-a.md. On-call health: ${REPO}/examples/oncall-health/team-a-12-weeks.md. Roadmap: ${F}/headcount/team-a-roadmap.csv. My figures: loaded cost per engineer GBP 110,000 a year; contractor GBP 650 a day. ${common}`,
  },
  {
    name: "headcount-case/team-b-2027-q1",
    team: "team-b",
    needs: ["capacity-plan/team-b-sprint-14", "tech-debt-register/team-b", "oncall-health/team-b-12-weeks"],
    prompt: `/em-tools:headcount-case Team B for 2027-Q1 (6 sprints of 2 weeks). Capacity plan: ${REPO}/examples/capacity-plan/team-b-sprint-14.md. Debt register: ${REPO}/examples/tech-debt-register/team-b.md. On-call health: ${REPO}/examples/oncall-health/team-b-12-weeks.md. Roadmap: ${F}/headcount/team-b-roadmap.csv. I have no cost figures yet. Also put in that B3 has covered release duty most weeks and has been working weekends, that is the strongest argument. ${common}`,
  },
];

rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });
// EM_TOOLS_NO_SERVER=1 runs a copy of the plugin without .mcp.json, to test file mode.
// Outputs go to examples/<name>.no-server.md so the lint checks them too.
const NO_SERVER = process.env.EM_TOOLS_NO_SERVER === "1";
// The copy lives in the system temp folder, so it is never inside the repo it copies.
const PLUGIN_DIR = NO_SERVER ? mkdtempSync(join(tmpdir(), "em-tools-no-server-")) : REPO;

// A selected example also runs the examples it reads, so its inputs are fresh.
const selected = new Set(EXAMPLES.filter((ex) => !ONLY.length || ONLY.some((o) => ex.name.includes(o))).flatMap((ex) => [ex.name, ...(ex.needs ?? [])]));
const unknown = [...selected].filter((n) => !EXAMPLES.some((ex) => ex.name === n));
if (unknown.length) throw new Error(`unknown example in needs: ${unknown.join(", ")}`);
if (NO_SERVER) {
  cpSync(REPO, PLUGIN_DIR, { recursive: true, filter: (src) => src !== WORK && !/[\\/](\.git|examples|node_modules)$/.test(src) });
  rmSync(join(PLUGIN_DIR, ".mcp.json"));
}
try {
  for (const ex of EXAMPLES) {
    if (!selected.has(ex.name)) continue;
    const notes = join(WORK, ex.name.replace("/", "_"), "notes");
    cpSync(join(F, "notes", ex.team), notes, { recursive: true });
    const settings = join(WORK, ex.name.replace("/", "_"), "settings.json");
    writeFileSync(settings, JSON.stringify({ pluginConfigs: { "em-tools@inline": { options: { locale: ex.team === "team-a" ? "en-GB" : "en-US", notes_folder: notes, enabled_integrations: [] } } } }));
    // In no-server mode, an example that reads other examples reads their .no-server outputs.
    const prompt = NO_SERVER ? ex.prompt.replace(/(\/examples\/[^\s]+?)\.md\b/g, "$1.no-server.md") : ex.prompt;
    process.stdout.write(`running ${ex.name} ... `);
    const r = spawnSync("claude", ["-p", "--plugin-dir", PLUGIN_DIR, "--settings", settings, "--permission-mode", "bypassPermissions", prompt], {
      cwd: dirname(notes), encoding: "utf8", timeout: 900_000, maxBuffer: 20 * 1024 * 1024,
    });
    const out = join(REPO, "examples", `${ex.name}${NO_SERVER ? ".no-server" : ""}.md`);
    mkdirSync(dirname(out), { recursive: true });
    const header = `<!-- em-tools example. Generated by scripts/run-examples.mjs against synthetic fixtures, zero integrations, locale ${ex.team === "team-a" ? "en-GB" : "en-US"}. -->\n\n`;
    writeFileSync(out, header + (r.stdout ?? "").trim() + "\n");
    console.log(r.status === 0 ? "ok" : `exit ${r.status} ${r.stderr?.slice(0, 200) ?? ""}`);
  }
} finally {
  if (NO_SERVER) rmSync(PLUGIN_DIR, { recursive: true, force: true });
}
