#!/usr/bin/env node
// Generates the synthetic fixtures in fixtures/. Deterministic: the same seed gives the
// same files. All people, companies and data are invented.
//
// Usage: node scripts/generate-fixtures.mjs

import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "fixtures");
const START = new Date("2026-04-20T00:00:00Z"); // Monday
const END = new Date("2026-10-16T23:59:59Z"); // Friday, 26 weeks later
const TODAY = "2026-10-19";
const DAY = 86_400_000;
const HOUR = 3_600_000;

// Seeded PRNG (mulberry32) ------------------------------------------------------
let seed = 20261019;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (xs) => xs[Math.floor(rand() * xs.length)];
const chance = (p) => rand() < p;
const between = (a, b) => a + rand() * (b - a);
function lognormalHours(medianH, spread = 0.8) {
  const z = Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());
  return medianH * Math.exp(spread * z);
}
const iso = (d) => new Date(Math.floor(new Date(d).getTime() / 60_000) * 60_000).toISOString().replace(":00.000Z", ":00Z");
const day = (d) => new Date(d).toISOString().slice(0, 10);

function weekdays(from = START, to = END) {
  const out = [];
  for (let t = from.getTime(); t <= to.getTime(); t += DAY) {
    const d = new Date(t);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) out.push(d);
  }
  return out;
}
function at(date, hh, mm = 0) {
  const d = new Date(date);
  d.setUTCHours(hh, mm, 0, 0);
  return d;
}
function workHour(date) {
  return at(date, Math.floor(between(9, 17)), Math.floor(between(0, 60)));
}

// People ---------------------------------------------------------------------------
// ai: probability that a PR is AI-assisted once the team rolls tools out.
// rate: PRs per week. start: first day. Persona flags drive the narrative.
const TEAM_A = {
  key: "team-a",
  name: "Team A",
  mission: "Payments platform: refunds, ledger and the public payments API",
  repo: "example-co/payments-api",
  domain: "team-a.example",
  em: { slug: "manager-a", name: "Manager A", role: "Engineering Manager" },
  people: [
    { slug: "eng-a1", name: "Engineer A1", level: "E4", role: "Senior Engineer", rate: 3.2, ai: 0.35, start: "2023-02-06", sub: "ledger", persona: "promo" },
    { slug: "eng-a2", name: "Engineer A2", level: "E4", role: "Senior Engineer", rate: 3.6, ai: 0.75, start: "2022-09-12", sub: "ledger", persona: "heavy-ai" },
    { slug: "eng-a3", name: "Engineer A3", level: "E3", role: "Engineer", rate: 1.6, ai: 0.2, start: "2024-05-13", sub: "api", persona: "struggling" },
    { slug: "eng-a4", name: "Engineer A4", level: "E3", role: "Engineer", rate: 1.8, ai: 0.4, start: "2026-08-24", sub: "api", persona: "new-joiner" },
    { slug: "eng-a5", name: "Engineer A5", level: "E3", role: "Engineer", rate: 2.8, ai: 0.65, start: "2024-11-04", sub: "ledger", persona: "heavy-ai" },
    { slug: "eng-a6", name: "Engineer A6", level: "E4", role: "Senior Engineer", rate: 2.4, ai: 0.08, start: "2021-06-21", sub: "api", persona: "light-ai" },
    { slug: "eng-a7", name: "Engineer A7", level: "E3", role: "Engineer", rate: 2.2, ai: 0.05, start: "2023-10-02", sub: "ledger", persona: "light-ai" },
  ],
  subTeams: { ledger: "Ledger" },
  tracker: "linear",
  calendar: "google",
  chat: "slack",
  aiTool: "claude-code",
  aiRollout: "2026-06-01",
  deployStyle: "continuous",
  cadence: "biweekly",
};

const TEAM_B = {
  key: "team-b",
  name: "Team B",
  mission: "Mobile apps: checkout, offline mode and app performance",
  repo: "example-co/mobile-app",
  domain: "team-b.example",
  em: { slug: "manager-b", name: "Manager B", role: "Engineering Manager" },
  people: [
    { slug: "eng-b1", name: "Engineer B1", level: "E4", role: "Senior Engineer", rate: 2.8, ai: 0.4, start: "2022-03-14", sub: "android", persona: "steady" },
    { slug: "eng-b2", name: "Engineer B2", level: "E3", role: "Engineer", rate: 3.0, ai: 0.8, start: "2024-01-08", sub: "android", persona: "heavy-ai" },
    { slug: "eng-b3", name: "Engineer B3", level: "E3", role: "Engineer", rate: 2.4, ai: 0.45, start: "2023-07-17", sub: "android", persona: "steady" },
    { slug: "eng-b4", name: "Engineer B4", level: "E4", role: "Senior Engineer", rate: 2.2, ai: 0.06, start: "2021-11-01", sub: "ios", persona: "light-ai" },
    { slug: "eng-b5", name: "Engineer B5", level: "E3", role: "Engineer", rate: 2.6, ai: 0.5, start: "2025-02-03", sub: "ios", persona: "steady" },
    { slug: "eng-b6", name: "Engineer B6", level: "E3", role: "Engineer", rate: 2.0, ai: 0.3, start: "2024-08-19", sub: "ios", persona: "steady" },
  ],
  subTeams: { ios: "iOS" },
  tracker: "jira",
  calendar: "outlook",
  chat: "teams",
  aiTool: "copilot",
  aiRollout: "2026-05-11",
  deployStyle: "weekly-release",
  cadence: "weekly",
};

const TEAMS = [TEAM_A, TEAM_B];
const email = (team, p) => `${p.slug}@${team.domain}`;
const ghLogin = (p) => p.slug;

// Files ----------------------------------------------------------------------------
function write(rel, content) {
  const path = join(ROOT, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content.endsWith("\n") ? content : content + "\n");
}
function csv(rows, cols) {
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

// Work vocabulary ---------------------------------------------------------------------
const WORK = {
  "team-a": {
    projects: ["Refunds v2", "Ledger reconciliation", "Payments API hardening"],
    verbs: ["Add", "Fix", "Refactor", "Harden", "Speed up", "Document", "Test"],
    nouns: ["refund state machine", "idempotency keys", "ledger export", "webhook retries", "currency rounding", "settlement report", "rate limiter", "audit log", "payout batching", "API pagination", "error codes", "reconciliation job"],
  },
  "team-b": {
    projects: ["Mobile checkout", "Offline mode", "App performance"],
    verbs: ["Add", "Fix", "Refactor", "Polish", "Speed up", "Test", "Migrate"],
    nouns: ["checkout sheet", "offline queue", "cold start", "image cache", "payment form", "address autocomplete", "crash reporter", "push permissions", "dark mode", "sync conflicts", "accessibility labels", "deep links"],
  },
};

// GitHub: PRs, reviews, deployments ------------------------------------------------------
function rateFor(team, p, d) {
  const start = new Date(p.start + "T00:00:00Z");
  if (d < start) return 0;
  const weeksIn = (d - start) / (7 * DAY);
  let r = p.rate;
  if (p.persona === "new-joiner") r *= Math.min(1, 0.3 + weeksIn / 8);
  if (p.persona === "struggling" && d > new Date("2026-07-15")) r *= 0.55;
  if (p.persona === "promo" && d > new Date("2026-08-01")) r *= 0.85; // more time on design and mentoring
  return r;
}

function genGithub(team) {
  const prs = [];
  const reviews = [];
  let number = team.key === "team-a" ? 1200 : 3400;
  const members = team.people;
  for (const d of weekdays()) {
    for (const p of members) {
      if (!chance(rateFor(team, p, d) / 5)) continue;
      const created = workHour(d);
      const aiOn = created >= new Date(team.aiRollout + "T00:00:00Z");
      const ramp = aiOn ? Math.min(1, (created - new Date(team.aiRollout)) / (60 * DAY) + 0.3) : 0;
      const ai = aiOn && chance(p.ai * ramp);
      let size = Math.round(lognormalHours(p.persona === "struggling" ? 260 : 120, 0.9));
      if (ai) size = Math.round(size * 1.6);
      const pickupH = lognormalHours(team.key === "team-a" ? 4 : 7, 0.9) * (p.persona === "struggling" ? 1.6 : 1);
      const reviewH = lognormalHours(team.key === "team-a" ? 10 : 16, 0.9) * (ai ? 1.35 : 1) * (p.persona === "struggling" ? 2.2 : 1);
      const firstCommit = new Date(created.getTime() - lognormalHours(20, 0.8) * HOUR);
      const firstReview = new Date(created.getTime() + pickupH * HOUR);
      const abandoned = chance(0.05);
      const merged = abandoned ? null : new Date(firstReview.getTime() + reviewH * HOUR);
      const open = merged && merged > END;
      const revertP = (ai ? 0.07 : 0.03) + (p.persona === "struggling" ? 0.06 : 0);
      const reverted = !!merged && !open && chance(revertP);
      const defect = !!merged && !open && chance(ai ? 0.09 : 0.05);
      const verb = pick(WORK[team.key].verbs);
      const noun = pick(WORK[team.key].nouns);
      const additions = Math.round(size * between(0.55, 0.85));
      const pr = {
        number: number++,
        repo: team.repo,
        title: `${verb} ${noun}`,
        author: ghLogin(p),
        created_at: iso(created),
        first_commit_at: iso(firstCommit),
        first_review_at: firstReview <= END ? iso(firstReview) : "",
        merged_at: merged && !open ? iso(merged) : "",
        closed_at: abandoned ? iso(new Date(created.getTime() + 5 * DAY)) : "",
        additions,
        deletions: size - additions,
        labels: ai ? (team.aiTool === "claude-code" ? "claude-code-assisted" : "copilot-assisted") : "",
        review_comments: Math.min(25, Math.round(lognormalHours(ai ? 5 : 3.5, 0.6) * (p.persona === "struggling" ? 1.8 : 1))),
        ai_assisted: ai,
        reverted,
        defect_linked: defect,
        churn_lines_21d: merged ? Math.round(additions * (ai ? between(0.12, 0.3) : between(0.04, 0.14))) : 0,
        is_draft: false,
        url: `https://github.com/${team.repo}/pull/${number - 1}`,
        _person: p,
      };
      prs.push(pr);
      if (reverted) {
        const rt = new Date(merged.getTime() + between(3, 30) * HOUR);
        const revertBy = pick(members.filter((m) => new Date(m.start) <= rt));
        prs.push({
          number: number++, repo: team.repo, title: `Revert "${pr.title}"`, author: ghLogin(revertBy),
          created_at: iso(rt), first_commit_at: iso(rt), first_review_at: iso(new Date(rt.getTime() + 0.5 * HOUR)),
          merged_at: iso(new Date(rt.getTime() + 1.5 * HOUR)), closed_at: "", additions: pr.deletions, deletions: pr.additions,
          labels: "revert", review_comments: 1, ai_assisted: false, reverted: false, defect_linked: false, churn_lines_21d: 0,
          is_draft: false, url: `https://github.com/${team.repo}/pull/${number - 1}`, _person: revertBy,
        });
      }
      // Reviews given by teammates (one or two reviewers).
      const reviewers = members.filter((m) => m !== p && new Date(m.start) <= created);
      const nRev = chance(0.4) ? 2 : 1;
      for (let i = 0; i < nRev && reviewers.length; i++) {
        let r = pick(reviewers);
        const promo = members.find((m) => m.persona === "promo" && m !== p);
        if (p.persona === "new-joiner" && chance(0.6)) r = promo ?? r;
        if (chance(0.25)) r = promo ?? r;
        if (firstReview > END) break;
        reviews.push({
          pr_number: pr.number, repo: team.repo, reviewer: ghLogin(r),
          submitted_at: iso(new Date(firstReview.getTime() + i * 2 * HOUR)),
          state: chance(0.3) ? "CHANGES_REQUESTED" : "APPROVED",
          comments: Math.max(0, Math.round(lognormalHours(2.5, 0.7))),
          url: `${pr.url}#pullrequestreview-${pr.number}${i}`,
        });
      }
    }
  }
  // An open PR waiting for review, and a large one, at the end of the window.
  const waiting = team.people[team.key === "team-a" ? 2 : 5];
  prs.push({
    number: number++, repo: team.repo, title: team.key === "team-a" ? "Retry failed payouts with backoff" : "Cache product images on disk",
    author: ghLogin(waiting), created_at: "2026-10-13T10:20:00Z", first_commit_at: "2026-10-12T15:00:00Z", first_review_at: "",
    merged_at: "", closed_at: "", additions: 640, deletions: 120, labels: "", review_comments: 0, ai_assisted: false,
    reverted: false, defect_linked: false, churn_lines_21d: 0, is_draft: false, url: `https://github.com/${team.repo}/pull/${number - 1}`, _person: waiting,
  });

  // Deployments.
  const deploys = [];
  let id = 1;
  if (team.deployStyle === "continuous") {
    for (const d of weekdays()) {
      const n = chance(0.15) ? 0 : chance(0.35) ? 2 : 1;
      for (let i = 0; i < n; i++) deploys.push({ id: `atl-${id++}`, repo: team.repo, deployed_at: iso(at(d, 11 + i * 4, 15)), environment: "production", status: chance(0.03) ? "failure" : "success" });
    }
  } else {
    for (const d of weekdays().filter((x) => x.getUTCDay() === 3)) deploys.push({ id: `bcn-${id++}`, repo: team.repo, deployed_at: iso(at(d, 14)), environment: "production", status: "success" });
  }
  // Hotfix and revert PRs ship in their own deploy shortly after merge.
  for (const pr of prs.filter((x) => x.labels === "revert" && x.merged_at)) {
    const t = new Date(new Date(pr.merged_at).getTime() + 1 * HOUR);
    if (t <= END) deploys.push({ id: `${team.key === "team-a" ? "atl" : "bcn"}-${id++}`, repo: team.repo, deployed_at: iso(t), environment: "production", status: "success" });
  }
  deploys.sort((a, b) => a.deployed_at.localeCompare(b.deployed_at));
  return { prs, reviews, deploys };
}

// Trackers ---------------------------------------------------------------------------
function genTracker(team, prs) {
  const issues = [];
  const projects = WORK[team.key].projects;
  let n = 1;
  const prefix = team.key === "team-a" ? "ATL" : "BCN";
  const cycleOf = (d) => `${team.tracker === "linear" ? "Cycle" : "Sprint"} ${1 + Math.floor((d - START) / (14 * DAY))}`;
  for (const pr of prs.filter((p) => !p.title.startsWith("Revert"))) {
    if (!chance(0.6)) continue;
    const created = new Date(new Date(pr.created_at).getTime() - between(2, 12) * DAY);
    const done = pr.merged_at ? new Date(new Date(pr.merged_at).getTime() + between(0.1, 2) * DAY) : null;
    const state = done && done <= END ? "Done" : "In Progress";
    issues.push({
      id: `${prefix}-${n++}`,
      title: pr.title,
      state,
      assignee: pr._person.name,
      project: pick(projects),
      cycle: cycleOf(new Date(pr.created_at)),
      created_at: iso(created < START ? START : created),
      started_at: pr.created_at,
      completed_at: state === "Done" ? iso(done) : "",
      updated_at: state === "Done" ? iso(done) : pr.created_at,
      labels: pr.defect_linked ? "bug" : "",
      blocked_by: "",
      estimate: pick([1, 2, 3, 5]),
      url: team.tracker === "linear" ? `https://linear.example.com/example-co/issue/${prefix}-${n - 1}` : `https://jira.example.com/browse/${prefix}-${n - 1}`,
    });
  }
  // Planned work for the current cycle, some of it quiet for weeks.
  const quiet = team.key === "team-a"
    ? [
        ["Refund webhooks for partial refunds", "Refunds v2", "eng-a3", "2026-09-22", ""],
        ["Ledger export to data warehouse", "Ledger reconciliation", "eng-a7", "2026-09-29", "DATA-88"],
        ["Refund API v2 endpoint for mobile checkout", "Refunds v2", "eng-a1", "2026-10-06", ""],
        ["Reconciliation tests green on staging", "Ledger reconciliation", "eng-a6", "2026-10-07", "INFRA-412"],
      ]
    : [
        ["Mobile checkout: refunds screen", "Mobile checkout", "eng-b1", "2026-10-01", "ATL-REFUND-V2"],
        ["Offline queue conflict resolution", "Offline mode", "eng-b6", "2026-09-24", "PROD-19"],
        ["Reduce cold start below 2s", "App performance", "eng-b4", "2026-10-08", ""],
      ];
  for (const [title, project, slug, updated, blocked] of quiet) {
    const p = team.people.find((x) => x.slug === slug);
    issues.push({
      id: `${prefix}-${n++}`, title, state: "In Progress", assignee: p.name, project, cycle: cycleOf(new Date("2026-10-12")),
      created_at: "2026-09-08T09:00:00Z", started_at: iso(new Date(updated + "T10:00:00Z")), completed_at: "", updated_at: iso(new Date(updated + "T10:00:00Z")),
      labels: blocked ? "blocked" : "", blocked_by: blocked, blocked_since: blocked ? updated : "", estimate: 5,
      url: team.tracker === "linear" ? `https://linear.example.com/example-co/issue/${prefix}-${n - 1}` : `https://jira.example.com/browse/${prefix}-${n - 1}`,
    });
  }
  // The cross-team dependency, from the Team A side.
  if (team.key === "team-a") {
    const dep = issues.find((i) => i.title === "Refund API v2 endpoint for mobile checkout");
    dep.id = "ATL-REFUND-V2";
    dep.labels = "cross-team;requested-by:Team B";
    dep.requested_at = "2026-09-15";
    dep.url = "https://linear.example.com/example-co/issue/ATL-REFUND-V2";
    dep.due = "2026-10-09";
  }
  // Days spent blocked on finished work, for the blocked share of cycle time. Deterministic, no random
  // draws, and never more than the working days the ticket was in progress.
  const workingDays = (a, b) => {
    let n = 0;
    for (let t = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate()); t < Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()); ) {
      t += DAY;
      const dow = new Date(t).getUTCDay();
      if (dow !== 0 && dow !== 6) n++;
    }
    return n;
  };
  for (const i of issues) {
    const num = parseInt(String(i.id).split("-")[1], 10);
    const span = i.state === "Done" ? workingDays(new Date(i.started_at), new Date(i.completed_at)) : 0;
    i.blocked_days = i.state === "Done" && Number.isFinite(num) && num % 11 === 0 ? Math.min(1 + (num % 3), span) : 0;
  }
  return issues;
}

// Calendar ---------------------------------------------------------------------------
function genCalendar(team) {
  const events = [];
  const everyone = [team.em, ...team.people];
  const emails = (ps, d) => ps.filter((p) => !p.start || new Date(p.start) <= d).map((p) => email(team, p)).join(";");
  const emEmail = email(team, team.em);
  let eid = 1;
  const add = (start, end, title, attendees, recurring, extra = {}) =>
    events.push({ id: `${team.key}-ev-${eid++}`, start: iso(start), end: iso(end), title, organizer: extra.organizer ?? emEmail, attendees, recurring, status: extra.status ?? "confirmed" });

  const days = weekdays(START, new Date("2026-10-30T23:59:59Z"));
  for (const d of days) {
    const dow = d.getUTCDay();
    if (d <= END) add(at(d, 9, 30), at(d, 9, 45), `${team.name} standup`, emails(everyone, d), true);
    if (dow === 1 && d <= END) add(at(d, 10), at(d, 11), `${team.name} planning`, emails(everyone, d), true);
    if (dow === 4 && d <= END) add(at(d, 14), at(d, 15), `${team.name} backlog refinement`, emails(everyone, d), true);
    const weekNo = Math.floor((d - START) / (7 * DAY));
    if (dow === 5 && weekNo % 2 === 1 && d <= END) add(at(d, 15), at(d, 16), `${team.name} retro`, emails(everyone, d), true);
    if (dow === 3 && d.getUTCDate() <= 7 && d <= END) add(at(d, 16), at(d, 17), "Engineering all-hands", emails(everyone, d), true, { organizer: "vp-eng@example-co.example" });
    // Team B has an extra cross-team sync that eats focus time.
    if (team.key === "team-b" && (dow === 2 || dow === 4) && d <= END) add(at(d, 13), at(d, 14), "Checkout sync with Team A", emails(everyone, d) + ";manager-a@team-a.example;eng-a1@team-a.example", true, { organizer: "pm-checkout@example-co.example" });
    // Ad hoc meetings.
    if (d <= END) for (const p of team.people) if (new Date(p.start) <= d && chance(team.key === "team-b" ? 0.3 : 0.18)) {
      const s = at(d, Math.floor(between(10, 16)), pick([0, 30]));
      add(s, new Date(s.getTime() + pick([30, 60]) * 60_000), pick(["Design review", "Incident follow-up", "Pairing", "Customer escalation", "Hiring debrief", "Interview"]), `${email(team, p)};${email(team, pick(team.people))}`, false, { organizer: email(team, p) });
    }
  }

  // 1:1s with the EM. Team A biweekly on Tuesdays, Team B weekly on Thursdays.
  team.people.forEach((p, i) => {
    const step = team.cadence === "weekly" ? 7 : 14;
    const startDay = team.cadence === "weekly" ? 4 : 2;
    let first = new Date(Math.max(START.getTime(), new Date(p.start + "T00:00:00Z").getTime()));
    while (first.getUTCDay() !== startDay) first = new Date(first.getTime() + DAY);
    for (let t = first.getTime(); t <= new Date("2026-10-30T23:59:59Z").getTime(); t += step * DAY) {
      const d = new Date(t);
      let status = "confirmed";
      // A3's 1:1s get cancelled twice in September and October. A4's next one is not booked.
      if (p.persona === "struggling" && ["2026-08-25", "2026-10-06"].includes(day(d))) status = "cancelled";
      if (p.persona === "new-joiner" && d > new Date("2026-10-08")) continue;
      if (team.key === "team-b" && p.slug === "eng-b4" && ["2026-09-24", "2026-10-01", "2026-10-08", "2026-10-15"].includes(day(d))) status = "cancelled";
      const s = at(d, 11 + (i % 5), i % 2 ? 30 : 0);
      add(s, new Date(s.getTime() + 30 * 60_000), `1:1 ${team.em.name} / ${p.name}`, `${emEmail};${email(team, p)}`, true, { status });
    }
  });
  events.sort((a, b) => a.start.localeCompare(b.start));
  return events;
}

// Chat ---------------------------------------------------------------------------------
function genChat(team) {
  const msgs = team.key === "team-a"
    ? [
        ["payments-eng", "2026-10-06T10:12:00Z", "Engineer A1", "Decision: refunds v2 keeps the old endpoint alive for 90 days after launch. RFC updated."],
        ["payments-eng", "2026-10-07T15:40:00Z", "Engineer A6", "Blocker: staging ledger DB is out of disk again, reconciliation tests are red until infra resizes it."],
        ["payments-eng", "2026-10-08T09:05:00Z", "Manager A", "Infra ticket raised for the staging disk. I will chase it at the platform sync."],
        ["payments-eng", "2026-10-09T16:20:00Z", "Engineer A1", "Refund API v2 for mobile slipped: idempotency edge case on partial refunds. New estimate 2026-10-23."],
        ["payments-eng", "2026-10-13T11:00:00Z", "Engineer A2", "Decision: we round per line item, not per order, for multi-currency refunds. Finance signed off."],
        ["payments-eng", "2026-10-14T13:30:00Z", "Engineer A5", "Heads up: Claude Code suggested a fix for the webhook retry bug that passed tests but double-sent in staging. Reverted, writing a regression test."],
        ["payments-eng", "2026-10-15T10:45:00Z", "Engineer A7", "Ledger export to the warehouse is waiting on a schema decision from Data. No movement since 29 Sep."],
        ["payments-launch", "2026-10-15T17:10:00Z", "Manager A", "Decision: refunds v2 launch moves to 2026-11-03 so mobile can ship the refunds screen the same week."],
        ["payments-launch", "2026-10-16T09:20:00Z", "Engineer A3", "Partial refund webhooks still in review. Need a second reviewer, A1 is out Monday."],
        ["random", "2026-10-16T12:00:00Z", "Engineer A4", "Lunch and learn on the ledger model was great, thanks A1."],
      ]
    : [
        ["Team B / General", "2026-10-06T09:30:00Z", "Engineer B1", "Blocker: refunds screen needs the Team A refund API v2. Team A says 2026-10-23 now."],
        ["Team B / General", "2026-10-07T14:00:00Z", "Manager B", "Decision: we ship checkout without refunds in 4.12 and add refunds in 4.13."],
        ["Team B / General", "2026-10-08T11:15:00Z", "Engineer B4", "Cold start work is paused, I am covering iOS release duties this week and next."],
        ["Team B / Releases", "2026-10-08T16:00:00Z", "Engineer B5", "4.11 released. Crash-free sessions 99.6 percent."],
        ["Team B / Releases", "2026-10-10T10:00:00Z", "Engineer B2", "Hotfix 4.11.1 for the address autocomplete crash on Android 12."],
        ["Team B / General", "2026-10-13T15:20:00Z", "Engineer B6", "Offline queue conflicts: need a product decision on last-write-wins vs merge. Waiting since 24 Sep."],
        ["Team B / General", "2026-10-14T10:05:00Z", "Manager B", "Decision: Copilot seats renewed for another quarter. Review usage and quality in January."],
        ["Team B / Releases", "2026-10-15T16:30:00Z", "Engineer B3", "4.12 released with the new checkout sheet."],
      ];
  return msgs.map(([channel, ts, user, text], i) => ({
    channel, ts, user, text, visibility: "public",
    permalink: team.chat === "slack" ? `https://slack.example.com/archives/C0TEAMA${i}/p${Date.parse(ts)}` : `https://teams.example.com/l/message/team-b/${Date.parse(ts)}`,
  }));
}

// Incidents ----------------------------------------------------------------------------------
function genIncidents(team, deploys) {
  const out = [];
  const ok = deploys.filter((d) => d.status === "success");
  const n = team.key === "team-a" ? 6 : 3;
  for (let i = 0; i < n; i++) {
    const d = ok[Math.floor(between(0.1, 0.95) * ok.length)];
    const s = new Date(new Date(d.deployed_at).getTime() + between(1, 20) * HOUR);
    out.push({
      id: `INC-${team.key.replace("-", "").toUpperCase()}-${i + 1}`, team: team.name, started_at: iso(s), resolved_at: iso(new Date(s.getTime() + lognormalHours(2, 0.7) * HOUR)),
      severity: pick(["SEV2", "SEV3", "SEV3"]), title: team.key === "team-a" ? pick(["Refund webhooks delayed", "Ledger export failed", "Payout batch stuck", "API 5xx spike"]) : pick(["Checkout crash on Android 12", "Login loop on iOS 18", "Images not loading offline"]),
      url: `https://incidents.example.com/${team.key}/${i + 1}`,
    });
  }
  // The SEV2 that A1 led, referenced in the EM's notes.
  if (team.key === "team-a") out.push({ id: "INC-TEAMA-7", team: team.name, started_at: "2026-07-14T13:05:00Z", resolved_at: "2026-07-14T13:57:00Z", severity: "SEV2", title: "Payout batch stuck", url: "https://incidents.example.com/team-a/7", lead: "Engineer A1" });
  return out.sort((a, b) => a.started_at.localeCompare(b.started_at));
}

// AI usage and spend -----------------------------------------------------------------------------
function genAi(team) {
  const usage = [];
  for (const d of weekdays()) {
    if (d < new Date(team.aiRollout)) continue;
    const ramp = Math.min(1, (d - new Date(team.aiRollout)) / (45 * DAY) + 0.25);
    for (const p of team.people) {
      if (new Date(p.start) > d) continue;
      const pActive = Math.min(0.95, p.ai * 1.15 * ramp + (p.persona === "light-ai" ? 0.02 : 0.05));
      if (chance(pActive)) usage.push({ person: ghLogin(p), date: day(d), tool: team.aiTool, active: true, team: team.name });
    }
  }
  const seat = team.aiTool === "claude-code" ? 100 : 39;
  const spend = [];
  for (const m of ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"]) {
    if (`${m}-31` < team.aiRollout) continue;
    const seats = team.people.filter((p) => p.start <= `${m}-28`).length;
    const usageCost = team.aiTool === "claude-code" ? Math.round(between(150, 420)) : 0;
    spend.push({ month: m, team: team.name, tool: team.aiTool, amount: seats * seat + usageCost, currency: "USD", note: team.aiTool === "claude-code" ? "seats plus usage" : "seats" });
  }
  return { usage, spend };
}

// 1:1 notes ------------------------------------------------------------------------------------
const GENERIC_TOPICS = [
  ["Sprint work", "Talked through current cycle work. On track.", "No new concerns."],
  ["Code review load", "Mentioned review queue feels long on Thursdays.", "Agreed to try a review slot after standup."],
  ["Career", "Revisited career goals. Wants more design work.", "I will look for a design doc they can own."],
  ["Team process", "Feedback that planning runs long.", "I will timebox planning to 45 minutes."],
  ["Learning", "Doing a course on distributed systems in own time.", "Offered learning budget."],
  ["Workload", "Workload feels about right this fortnight.", ""],
  ["Feedback for me", "Asked for earlier notice on priority changes.", "I will share roadmap changes in the team channel first."],
  ["Holiday", "Planning two weeks off in August.", "Cover plan agreed."],
];

const PERSONA_NOTES = {
  "eng-a1": {
    goals: ["Reach Staff (E5) within 12 months", "Lead a cross-team design end to end"],
    prefs: "Direct feedback in writing first, then talk it through",
    entries: {
      "2026-05-05": ["Refunds v2 design", "Volunteered to write the refunds v2 RFC. Clear on the scope and the mobile dependency.", "I will add Manager B's team as reviewers."],
      "2026-06-02": ["RFC review", "RFC approved after review with Team B and Finance. Handled pushback on the 90-day deprecation calmly and changed the plan to keep the old endpoint.", "Share the RFC at the architecture forum."],
      "2026-06-30": ["Mentoring", "Started pairing with A7 on the ledger model twice a week. Asked how to give feedback on design without taking over.", "Suggested Lara Hogan's feedback equation."],
      "2026-08-25": ["New joiner", "Agreed to be A4's onboarding buddy. Wrote an onboarding guide to the ledger.", "Check in with A4 after week 2."],
      "2026-09-08": ["Promotion", "Talked about the E5 case. Strongest evidence: refunds v2 design, mentoring, incident leadership in July. Gap: little evidence of setting direction beyond the team.", "I will ask for a slot at the platform guild so A1 can propose the idempotency standard."],
      "2026-10-06": ["Refund API slip", "Refund API v2 for mobile is late by about two weeks due to the partial refund edge case. Raised it with Team B early.", "I will update the exec update and the launch date."],
    },
    evidence: [
      ["ev-a1-rfc", "2026-06-02", "manual", "https://docs.example.com/rfc/refunds-v2", "Refunds v2 needed a design that both the API and mobile teams could build against.", "Wrote the refunds v2 RFC, ran reviews with Team B and Finance, and changed the deprecation plan after feedback.", "Two teams aligned on one design; Finance signed off in one review round.", "technical-design"],
      ["ev-a1-incident", "2026-07-14", "note", null, "Payout batch stuck for 40 minutes during a SEV2.", "Took incident lead, kept the channel updated every 10 minutes and wrote the timeline.", "Recovered in 52 minutes; postmortem actions owned and closed in two weeks.", "ownership"],
      ["ev-a1-mentoring", "2026-09-01", "note", null, "A7 wanted to grow in ledger design.", "Paired twice a week for 8 weeks and reviewed her design doc with written comments.", "A7 led the ledger export design review herself in September.", "mentoring"],
      ["ev-a1-onboarding", "2026-09-12", "note", null, "A4 joined with no payments background.", "Wrote a ledger onboarding guide and paired on her first three PRs.", "A4 merged her first PR in week 2.", "mentoring"],
      ["ev-a1-slip", "2026-10-09", "slack", "https://slack.example.com/archives/C0TEAMA3/p1791562800000", "Refund API v2 hit a partial refund edge case late.", "Flagged the slip in public with a new date and the reason.", "Team B re-planned the refunds screen a week ahead rather than at the deadline.", "collaboration"],
    ],
  },
  "eng-a3": {
    goals: ["Get faster at shipping well-scoped changes", "Learn the ledger domain"],
    prefs: "Prefers to talk first, then get a written summary",
    entries: {
      "2026-07-14": ["Workload", "Said the refund webhooks work is bigger than estimated. Seems stuck on the retry design.", "Pair with A6 on the retry design this week."],
      "2026-07-28": ["Delivery", "Two PRs reverted in July. Said they felt rushed to merge before the cycle ended.", "Agreed smaller PRs and a checklist before merge. I will stop the end-of-cycle push."],
      "2026-08-11": ["Expectations", "Set clear written expectations: PRs under 300 lines, ask for help after half a day stuck, update the ticket daily.", "Sent the summary in writing after the 1:1."],
      "2026-09-08": ["Wellbeing", "Mentioned sleeping badly and a family situation. Did not want to go into detail.", "Reminded about the employee assistance programme and flexible hours. Offered to lighten on-call."],
      "2026-09-22": ["Progress", "PR sizes are down. Still slow to ask for help. Partial refund webhooks open since 22 Sep.", "Daily 10-minute check-in for two weeks."],
    },
    evidence: [
      ["ev-a3-retry", "2026-06-16", "github", "https://github.example.com/example-co/payments-api/pull/1251", "Webhook retries were failing silently.", "Found the root cause and added alerting on retry exhaustion.", "Silent failures dropped to zero over the next month.", "execution"],
      ["ev-a3-reverts", "2026-07-24", "note", null, "End of cycle with two webhook PRs pending.", "Merged both PRs after one approval each, before tests on staging finished.", "Both were reverted within a day; one caused a SEV3.", "execution"],
      ["ev-a3-smaller", "2026-09-24", "github", "https://github.example.com/example-co/payments-api/pull/1388", "Partial refund webhooks needed a large change.", "Split it into four PRs under 250 lines each.", "Review time on those PRs halved compared with July.", "execution"],
    ],
  },
  "eng-a4": {
    goals: ["Ship a customer-facing change by end of first quarter", "Understand the ledger model"],
    prefs: "Likes examples and written feedback",
    entries: {
      "2026-08-25": ["Week 1", "First 1:1. Likes recognition in private. Gets grumpy when priorities change without context.", "Set 30/60/90 goals together. A1 is buddy."],
      "2026-09-08": ["Week 3", "First PR merged. Finds the ledger docs thin.", "Asked A1's guide to be added to the wiki."],
      "2026-09-22": ["Week 5", "Picked up the API pagination fix. Confident with the codebase layout now.", "Next: own a small project in Refunds v2."],
    },
    evidence: [["ev-a4-first-pr", "2026-09-04", "github", "https://github.example.com/example-co/payments-api/pull/1362", "New to the codebase in week 2.", "Shipped a pagination fix with tests and docs.", "Closed a long-standing customer complaint about missing results.", "execution"]],
  },
  "eng-a2": {
    goals: ["Grow into a tech lead role", "Speak at an internal tech talk"],
    prefs: "Quick feedback in Slack is fine",
    entries: {
      "2026-06-16": ["AI tools", "Early adopter of Claude Code. Offered to run a session for the team.", "Book a lunch and learn."],
      "2026-10-06": ["Multi-currency", "Drafting the per-line rounding proposal with Finance.", "Write it up as an ADR once agreed."],
    },
    evidence: [["ev-a2-rounding", "2026-10-13", "slack", "https://slack.example.com/archives/C0TEAMA4/p1791889200000", "Multi-currency refunds rounded inconsistently.", "Proposed per-line rounding with worked examples and got Finance sign-off.", "Removed a class of penny mismatches in reconciliation.", "technical-design"]],
  },
};

function weekdayOn(dateStr, dow) {
  let d = new Date(dateStr + "T00:00:00Z");
  while (d.getUTCDay() !== dow) d = new Date(d.getTime() + DAY);
  return d;
}

function personNote(team, p, calendar, prs) {
  const extra = PERSONA_NOTES[p.slug] ?? {};
  const oneOnOnes = calendar.filter((e) => e.title.startsWith("1:1") && e.attendees.includes(email(team, p)));
  const past = oneOnOnes.filter((e) => e.start <= TODAY && e.status === "confirmed");
  const next = oneOnOnes.find((e) => e.start > TODAY && e.status === "confirmed");
  const log = [];
  const special = Object.entries(extra.entries ?? {});
  for (const [sd] of special) if (!past.some((e) => day(e.start) === sd)) throw new Error(`${p.slug}: no confirmed 1:1 on ${sd}`);
  let gi = Math.floor(rand() * GENERIC_TOPICS.length);
  for (const e of past) {
    const d = day(e.start);
    const near = special.find(([sd]) => sd === d);
    const [topic, said, act] = near ? near[1] : GENERIC_TOPICS[gi++ % GENERIC_TOPICS.length];
    if (!near && chance(0.35)) continue; // not every 1:1 gets notes
    log.unshift(`### ${d} 1:1\n- **${topic}:** ${said}${act ? `\n- **Next:** ${act}` : ""}`);
  }
  const fm = {
    name: p.name,
    slug: p.slug,
    role: p.role,
    level: p.level,
    team: team.name,
    sub_team: team.subTeams[p.sub] ?? null,
    start_date: p.start,
    email: email(team, p),
    github: ghLogin(p),
    one_on_one_cadence: team.cadence,
    next_one_on_one: next ? day(next.start) : null,
    career_goals: extra.goals ?? ["Keep growing in current role"],
    feedback_preferences: extra.prefs ?? "Not recorded yet",
  };
  const yaml = Object.entries(fm).map(([k, v]) => Array.isArray(v) ? `${k}:\n${v.map((x) => `  - ${x}`).join("\n")}` : `${k}: ${v === null ? "null" : /[:#]/.test(String(v)) ? JSON.stringify(v) : v}`).join("\n");
  const threads = {
    "eng-a3": "- Partial refund webhooks stuck in review since 2026-09-22\n- Wellbeing: check in gently, offered EAP on 2026-09-08",
    "eng-a1": "- E5 case: needs evidence of direction-setting beyond the team\n- Refund API v2 new date 2026-10-23",
    "eng-a4": "- 30/60/90 plan: day 60 review due 2026-10-23",
    "eng-b4": "- Cold start work paused while covering iOS release duties",
  }[p.slug] ?? "";
  const actions = {
    "eng-a3": "- [ ] EM: reschedule the cancelled 2026-10-06 1:1 (due 2026-10-10)\n- [x] EM: send written expectations summary (due 2026-08-19)\n- [ ] A3: ask for help after half a day stuck (ongoing)",
    "eng-a1": "- [ ] EM: get A1 a platform guild slot for the idempotency standard (due 2026-10-31)\n- [x] A1: share refunds RFC at architecture forum (due 2026-06-20)",
    "eng-a4": "- [ ] EM: book the next 1:1, none scheduled after 2026-10-06 (due 2026-10-20)\n- [ ] A4: pick a Refunds v2 project (due 2026-10-24)",
  }[p.slug] ?? "- [x] EM: follow up on last 1:1 actions";
  // Point GitHub evidence at a real merged PR by this person, on or just before the evidence date.
  const prLink = (date, fallback) => {
    const mine = prs.filter((x) => x._person === p && x.merged_at && x.merged_at.slice(0, 10) <= date && !x.title.startsWith("Revert"));
    return mine.length ? mine[mine.length - 1].url : fallback;
  };
  const evidence = (extra.evidence ?? []).map(([id, date, source, link0, s, b, i, comp]) => [id, date, source, source === "github" ? prLink(date, link0) : link0, s, b, i, comp]).map(([id, date, source, link, s, b, i, comp]) =>
    "```yaml evidence\n" + [`id: ${id}`, `person: ${p.slug}`, `source: ${source}`, `date: ${date}`, `link: ${link ?? "null"}`, `situation: ${JSON.stringify(s)}`, `behaviour: ${JSON.stringify(b)}`, `impact: ${JSON.stringify(i)}`, `competency: ${comp}`, `captured: ${date}`].join("\n") + "\n```").join("\n\n");
  return `---\n${yaml}\n---\n\n# ${p.name}\n\n## Log\n\n${log.join("\n\n")}\n\n## Open threads\n\n${threads}\n\n## Actions\n\n${actions}\n\n## Evidence\n\n${evidence}\n`;
}

function teamNote(team) {
  const sub = Object.entries(team.subTeams).map(([k, v]) => `  ${v}:\n${team.people.filter((p) => p.sub === k).map((p) => `    - ${p.slug}`).join("\n")}`).join("\n");
  return `---
team: ${team.name}
mission: "${team.mission}"
manager: ${team.em.slug}
members:
${team.people.map((p) => `  - ${p.slug}`).join("\n")}
sub_teams:
${sub}
one_on_one_cadence: ${team.cadence}
repos:
  - ${team.repo}
tracker: ${team.tracker}
calendar: ${team.calendar}
channels:
${(team.chat === "slack" ? ["payments-eng", "payments-launch"] : ["Team B / General", "Team B / Releases"]).map((c) => `  - "${c}"`).join("\n")}
ai_tools:
  - ${team.aiTool}
${team.key === "team-a" ? "ladder: ladder.md\nexpectations_storage: separate-file\n" : ""}---

# ${team.name}

${team.mission}. Synthetic team for em-tools fixtures.
`;
}

const LADDER = `# ExampleCo engineering ladder (synthetic)

Competencies: execution, technical-design, collaboration, mentoring, ownership.

| Competency | E3 Engineer | E4 Senior Engineer | E5 Staff Engineer |
|---|---|---|---|
| execution | Ships well-scoped tasks with tests | Ships multi-week projects predictably | Delivers multi-team initiatives |
| technical-design | Follows existing designs | Designs systems for the team | Sets technical direction across teams |
| collaboration | Communicates status clearly | Aligns with partner teams | Builds agreement across the org |
| mentoring | Helps peers in review | Mentors engineers in the team | Grows senior engineers and leads |
| ownership | Owns own tasks | Owns a service or area | Owns outcomes across services |
`;

// Main ------------------------------------------------------------------------------------
rmSync(ROOT, { recursive: true, force: true });
const readme = [];
const aiUsageAll = [];
const aiSpendAll = [];
for (const team of TEAMS) {
  const { prs, reviews, deploys } = genGithub(team);
  const issues = genTracker(team, prs);
  const calendar = genCalendar(team);
  const chat = genChat(team);
  const incidents = genIncidents(team, deploys);
  const ai = genAi(team);
  aiUsageAll.push(...ai.usage);
  aiSpendAll.push(...ai.spend);

  const prCols = ["number", "repo", "title", "author", "created_at", "first_commit_at", "first_review_at", "merged_at", "closed_at", "additions", "deletions", "labels", "review_comments", "ai_assisted", "reverted", "defect_linked", "churn_lines_21d", "is_draft", "url"];
  write(`github/${team.key}-prs.csv`, csv(prs, prCols));
  write(`github/${team.key}-reviews.csv`, csv(reviews, ["pr_number", "repo", "reviewer", "submitted_at", "state", "comments", "url"]));
  write(`github/${team.key}-deployments.csv`, csv(deploys, ["id", "repo", "deployed_at", "environment", "status"]));
  const issueCols = ["id", "title", "state", "assignee", "project", "cycle", "created_at", "started_at", "completed_at", "updated_at", "labels", "blocked_by", "blocked_since", "blocked_days", "requested_at", "estimate", "url", "due"];
  if (team.tracker === "linear") write(`linear/${team.key}-issues.csv`, csv(issues, issueCols));
  else write(`jira/${team.key}-issues.csv`, csv(issues.map((i) => ({ key: i.id, summary: i.title, status: i.state, assignee: i.assignee, epic: i.project, sprint: i.cycle, created: i.created_at, resolved: i.completed_at, updated: i.updated_at, labels: i.labels, blocked_by: i.blocked_by, blocked_since: i.blocked_since, blocked_days: i.blocked_days, story_points: i.estimate, url: i.url })), ["key", "summary", "status", "assignee", "epic", "sprint", "created", "resolved", "updated", "labels", "blocked_by", "blocked_since", "blocked_days", "story_points", "url"]));
  write(`calendar/${team.key}-${team.calendar}.csv`, csv(calendar, ["id", "start", "end", "title", "organizer", "attendees", "recurring", "status"]));
  write(`${team.chat}/${team.key}-messages.json`, JSON.stringify(chat, null, 2));
  write(`incidents/${team.key}-incidents.csv`, csv(incidents, ["id", "team", "started_at", "resolved_at", "severity", "title", "lead", "url"]));

  const notesDir = `notes/${team.key}`;
  write(`${notesDir}/team.md`, teamNote(team));
  if (team.key === "team-a") write(`${notesDir}/ladder.md`, LADDER);
  for (const p of team.people) write(`${notesDir}/people/${p.slug}.md`, personNote(team, p, calendar, prs));

  readme.push(`| ${team.name} | ${team.em.name} | ${team.people.length} | ${team.tracker} | ${team.calendar} | ${team.chat} | ${team.aiTool} | ${prs.length} | ${deploys.length} |`);
}
// On-call: generated last, so its random draws never change the data above.
function genOncall(team) {
  const rotations = team.key === "team-a"
    ? [{ name: "Payments primary", hours: 168, members: ["eng-a1", "eng-a2", "eng-a3", "eng-a5", "eng-a6", "eng-a7"], late: { slug: "eng-a4", from: "2026-10-05" } }]
    : [
        { name: "Mobile primary", hours: 168, members: ["eng-b1", "eng-b2", "eng-b3", "eng-b4", "eng-b5", "eng-b6"] },
        { name: "Release duty", hours: 12, weekdaysOnly: true, members: ["eng-b4", "eng-b5", "eng-b6"] },
      ];
  const alerts = team.key === "team-a"
    ? [["ledger-export-lag", false, 0.34], ["staging-disk-full", false, 0.18], ["api-5xx-rate", true, 0.2], ["payout-batch-stuck", true, 0.12], ["webhook-retry-exhausted", true, 0.16]]
    : [["crash-rate-android", true, 0.3], ["crash-rate-ios", true, 0.2], ["push-delivery-lag", false, 0.3], ["image-cdn-latency", false, 0.2]];
  const shifts = [];
  const pages = [];
  let pid = 1;
  for (const rot of rotations) {
    let i = 0;
    const step = rot.hours * HOUR;
    for (let t = at(START, 9).getTime(); t < END.getTime(); t += rot.hours === 12 ? DAY : step) {
      const d = new Date(t);
      if (rot.weekdaysOnly && (d.getUTCDay() === 0 || d.getUTCDay() === 6)) continue;
      const pool = rot.late && day(d) >= rot.late.from ? [...rot.members, rot.late.slug] : rot.members;
      const member = pool[i++ % pool.length];
      const end = new Date(t + rot.hours * HOUR);
      shifts.push({ rotation: rot.name, start: iso(d), end: iso(end), member });
      // Pages per shift: more noise from August on Team A, more crash pages around releases on Team B.
      const busy = team.key === "team-a" ? (d >= new Date("2026-08-01") ? 6 : 3.5) : rot.hours === 12 ? 0.6 : 3;
      const n = Math.max(0, Math.round(busy + between(-2, 2.5)));
      for (let k = 0; k < n; k++) {
        const created = new Date(t + rand() * rot.hours * HOUR);
        if (created > END) continue;
        const r = rand();
        let acc = 0;
        let pick_ = alerts[0];
        for (const al of alerts) { acc += al[2]; if (r <= acc) { pick_ = al; break; } }
        const ackMin = Math.round(lognormalHours(6, 0.8) * (created.getUTCHours() < 7 ? 2 : 1));
        pages.push({
          id: `${team.key === "team-a" ? "PA" : "PB"}-${pid++}`, rotation: rot.name, created_at: iso(created),
          acknowledged_at: iso(new Date(created.getTime() + ackMin * 60_000)),
          resolved_at: iso(new Date(created.getTime() + (ackMin + Math.round(lognormalHours(35, 0.9))) * 60_000)),
          alert: pick_[0], actionable: pick_[1], urgency: pick_[1] ? "high" : "low",
          url: `https://${team.key === "team-a" ? "pagerduty" : "incident-io"}.example.com/${team.key}/alerts/${pid - 1}`,
        });
      }
    }
  }
  pages.sort((x, y) => x.created_at.localeCompare(y.created_at));
  return { shifts, pages };
}
for (const team of TEAMS) {
  const { shifts, pages } = genOncall(team);
  const dir = team.key === "team-a" ? "pagerduty" : "incident-io";
  write(`${dir}/${team.key}-shifts.csv`, csv(shifts, ["rotation", "start", "end", "member"]));
  write(`${dir}/${team.key}-pages.csv`, csv(pages, ["id", "rotation", "created_at", "acknowledged_at", "resolved_at", "alert", "urgency", "actionable", "url"]));
}
write("ai/usage.csv", csv(aiUsageAll, ["person", "team", "date", "tool", "active"]));
write("ai/spend.csv", csv(aiSpendAll, ["month", "team", "tool", "amount", "currency", "note"]));
write("notes/team-a/drafts/2026-10-12-upward-update.md", `# Team A weekly update, week of 2026-10-05 (exec version)

- **Asks:** none this week.
- **Done:** multi-currency rounding agreed with Finance; webhook retry alerting live.
- **Slipped:** Refund API v2 for mobile, from 2026-10-09 to 2026-10-23 (partial refund edge case).
- **Risks:** staging ledger disk keeps filling up; reconciliation tests unreliable.
- **Next:** refunds v2 launch readiness review.
`);

// Postmortem inputs: one incident channel per team and each team's postmortem actions.
// Written last with no random draws, so other fixtures are unchanged. The channels name
// people and one message blames a person on purpose: postmortem-draft must use roles.
const msg = (channel, ts, user, text, link) => ({ channel, ts, user, text, visibility: "public", permalink: link });
const slackLink = (ts) => `https://slack.example.com/archives/C0TEAMAINC7/p${Date.parse(ts) / 1000}000000`.slice(0, 66);
const teamsLink = (ts) => `https://teams.example.com/l/message/team-b-inc-1/${Date.parse(ts)}`;
const incA = "inc-2026-07-14-payouts";
write("postmortem/team-a-inc-7-channel.json", JSON.stringify([
  ["2026-07-14T13:05:00Z", "PagerDuty", "Triggered: payout-batch-age above 30 minutes (Payments primary)."],
  ["2026-07-14T13:07:00Z", "Engineer A1", "Acking. I'll take incident lead. Opening this channel."],
  ["2026-07-14T13:10:00Z", "Engineer A1", "Status: the 13:00 payout batch has not left the queue. About 1,900 merchant payouts waiting. No data loss seen so far."],
  ["2026-07-14T13:14:00Z", "Engineer A6", "The payout worker is crash-looping with out-of-memory errors since 12:52."],
  ["2026-07-14T13:18:00Z", "Engineer A2", "The batch size config went from 500 to 5000 in the 12:06 production deploy (atl-148). The new batch size first applied to the 12:45 run. Each worker loads the whole batch into memory."],
  ["2026-07-14T13:20:00Z", "Manager A", "Engineer A5 merged that without load testing it. They should have known better."],
  ["2026-07-14T13:22:00Z", "Engineer A1", "Let's keep to the system for now. Decision: roll back the batch size config, not the whole deploy."],
  ["2026-07-14T13:31:00Z", "Engineer A6", "Config rolled back to 500. Workers are stable."],
  ["2026-07-14T13:40:00Z", "Engineer A1", "Status: the batch is draining. About 600 payouts left."],
  ["2026-07-14T13:52:00Z", "Engineer A1", "All payouts sent. Latest one went out 52 minutes late. Finance told about the delay."],
  ["2026-07-14T13:57:00Z", "Engineer A1", "Resolved. The config change passed review and CI; nothing in CI exercises a full-size batch. Postmortem actions in the tracker."],
].map(([ts, u, t]) => msg(incA, ts, u, t, slackLink(ts))), null, 2) + "\n");
const incB = "Team B / inc-2026-09-03-android-checkout";
write("postmortem/team-b-inc-1-channel.json", JSON.stringify([
  ["2026-09-03T06:13:00Z", "incident.io", "Alert: checkout crash rate above 2% on Android (Release duty)."],
  ["2026-09-03T06:21:00Z", "Engineer B5", "On it. Crashes are all Android 12, app version 4.9.0, on the payment sheet."],
  ["2026-09-03T06:35:00Z", "Engineer B5", "Started at the 4.9.0 staged rollout to 20% last night. Stack trace points at the new card scanner library."],
  ["2026-09-03T06:48:00Z", "Engineer B3", "The scanner library needs a camera permission flow that Android 12 handles differently. Our test devices are all Android 13 and 14."],
  ["2026-09-03T07:02:00Z", "Engineer B5", "Decision: halt the staged rollout and turn off the card-scanner flag remotely."],
  ["2026-09-03T07:10:00Z", "Engineer B5", "Flag off. Crash rate dropping."],
  ["2026-09-03T08:30:00Z", "Manager B", "Support says about 340 customers hit the crash. B3 picked that library, so B3 owns the fix."],
  ["2026-09-03T09:07:00Z", "Engineer B5", "Crash rate back to baseline. Resolved. Rollout stays halted until a fix ships."],
].map(([ts, u, t]) => msg(incB, ts, u, t, teamsLink(ts))), null, 2) + "\n");
const actionCols = ["id", "incident", "title", "owner_role", "owner", "created_at", "due", "completed_at", "link"];
const act = (team, n, inc, title, role, owner, created, due, done) => ({ id: `${team}-PM-${n}`, incident: inc, title, owner_role: role, owner, created_at: created, due, completed_at: done, link: `https://${team === "ATL" ? "linear" : "jira"}.example.com/${team}-PM-${n}` });
write("postmortem/team-a-actions.csv", csv([
  act("ATL", 1, "INC-TEAMA-7", "Add a full-size batch load test to CI", "tech lead", "Engineer A2", "2026-07-15", "2026-08-15", ""),
  act("ATL", 2, "INC-TEAMA-7", "Stream payout batches instead of loading them into memory", "payments engineer", "Engineer A6", "2026-07-15", "2026-09-30", ""),
  act("ATL", 3, "INC-TEAMA-7", "Alert on payout worker restarts", "on-call engineer", "Engineer A1", "2026-07-15", "2026-07-31", "2026-07-24"),
  act("ATL", 4, "INC-TEAMA-7", "Add a limit check on batch size config", "payments engineer", "Engineer A5", "2026-07-15", "2026-08-01", "2026-07-30"),
  act("ATL", 5, "INC-TEAMA-2", "Document the payout batch rerun steps in the runbook", "on-call engineer", "Engineer A7", "2026-08-03", "2026-08-21", ""),
  act("ATL", 6, "INC-TEAMA-6", "Page only after two failed retries", "on-call engineer", "", "2026-08-05", "", ""),
  act("ATL", 7, "INC-TEAMA-1", "Add a dashboard for webhook queue depth", "team", "Engineer A3", "2026-07-22", "2026-08-05", "2026-08-12"),
], actionCols));
write("postmortem/team-b-actions.csv", csv([
  act("MOB", 1, "INC-TEAMB-1", "Add Android 12 devices to the release test matrix", "release duty", "Engineer B4", "2026-09-04", "2026-09-30", ""),
  act("MOB", 2, "INC-TEAMB-1", "Gate new SDKs behind a staged flag by default", "tech lead", "Engineer B3", "2026-09-04", "2026-10-15", ""),
  act("MOB", 3, "INC-TEAMB-1", "Alert on crash rate per OS version", "on-call engineer", "Engineer B5", "2026-09-04", "2026-09-18", "2026-09-16"),
  act("MOB", 4, "INC-TEAMB-3", "Fix checkout crash on rotate", "android engineer", "Engineer B6", "2026-07-24", "2026-08-07", "2026-08-06"),
], actionCols));

// Hiring: Team A is hiring a Senior Engineer (E4). Candidates use codes. Scorecards are
// written in the interviewer's words with no score field. Candidate C2 is missing one
// scorecard before the debrief. Written last with no random draws.
const role = "senior-engineer-payments";
write(`hiring/team-a-interviewers.csv`, csv([
  { interviewer: "Engineer A1", trained_for: "technical-design;collaboration", available: "yes" },
  { interviewer: "Engineer A2", trained_for: "execution;technical-design", available: "yes" },
  { interviewer: "Engineer A5", trained_for: "execution", available: "no (on-call week of 2026-10-26)" },
  { interviewer: "Engineer A6", trained_for: "ownership;execution", available: "yes" },
  { interviewer: "Manager A", trained_for: "collaboration;mentoring;ownership", available: "yes" },
], ["interviewer", "trained_for", "available"]));
const HFENCE = "`".repeat(3);
const candNote = (n) => `${HFENCE}yaml candidate-note\n${Object.entries(n).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("\n")}\n${HFENCE}`;
const candFile = (cand, notes) => `---
candidate: ${cand}
role: ${role}
---

# ${cand}: ${role}

Append-only. Written scorecards and notes in the writer's own words. Follow your organisation's retention policy for candidate data; em-tools never deletes files.

## Notes

${notes.map(candNote).join("\n\n")}
`;
const sc = (cand, id, stage, interviewer, date, text) => ({ id, candidate: cand, kind: "scorecard", stage, interviewer, date, text, captured: date });
write(`notes/team-a/hiring/${role}/candidates/cand-c1.md`, candFile("cand-c1", [
  sc("cand-c1", "c1-screen", "recruiter screen", "Recruiter", "2026-10-02", "Five years on payments backends. Wants a team with on-call that is shared fairly."),
  sc("cand-c1", "c1-execution", "execution: past project deep dive", "Engineer A2", "2026-10-09", "Walked through a ledger migration end to end, including the rollback plan. Gave clear numbers on scope and slippage."),
  sc("cand-c1", "c1-design", "technical design: refunds service", "Engineer A1", "2026-10-09", "Started with idempotency and retries. Did not get to data retention in the time."),
  sc("cand-c1", "c1-collab", "collaboration and ownership", "Manager A", "2026-10-10", "Gave two examples of aligning with a finance team. Said they would push back on a launch date with data."),
]));
write(`notes/team-a/hiring/${role}/candidates/cand-c2.md`, candFile("cand-c2", [
  sc("cand-c2", "c2-screen", "recruiter screen", "Recruiter", "2026-10-06", "Seven years backend, two in payments. Currently a tech lead for three engineers."),
  sc("cand-c2", "c2-execution", "execution: past project deep dive", "Engineer A6", "2026-10-15", "Described splitting a large migration into weekly releases. Vague on how they measured success."),
  sc("cand-c2", "c2-design", "technical design: refunds service", "Engineer A1", "2026-10-15", "Drew the queue and the retry path quickly. Asked good questions about partial refunds."),
]));
write(`notes/team-a/hiring/${role}/2026-09-28-loop-plan.md`, `# Loop plan: Senior Engineer, Payments (E4)

Saved 2026-09-28. Draft for review.

| Stage | Competencies | Length | Interviewers |
|---|---|---|---|
| Recruiter screen | motivation, logistics | 30 min | Recruiter |
| Execution: past project deep dive | execution, ownership | 60 min | Engineer A2 or Engineer A6 |
| Technical design: refunds service | technical-design | 60 min | Engineer A1 |
| Collaboration and ownership | collaboration, mentoring, ownership | 45 min | Manager A |

Debrief: written scorecards before discussion. Debrief for cand-c2 booked for 2026-10-20.
`);

// Capacity inputs: past sprint totals, PTO and the published on-call schedule for the next
// sprint (2026-10-19 to 2026-10-30). Written last with no random draws.
const sprintCols = ["sprint", "start", "end", "planned_points", "completed_points", "unplanned_points", "completed_items", "unplanned_items"];
const sprintRows = (label, rows) => rows.map(([n, start, end, planned, done, unplanned, items, unplannedItems]) => ({ sprint: `${label} ${n}`, start, end, planned_points: planned, completed_points: done, unplanned_points: unplanned, completed_items: items, unplanned_items: unplannedItems }));
// Same 14-day cadence as the tracker fixtures: cycle n starts 2026-04-20 + 14 x (n - 1) days.
const pastSprints = [9, 10, 11, 12, 13].map((n) => {
  const start = new Date(START.getTime() + 14 * (n - 1) * DAY);
  return [n, day(start), day(new Date(start.getTime() + 11 * DAY))];
});
write("capacity/team-a-sprints.csv", csv(sprintRows("Cycle", [
  [...pastSprints[0], 34, 30, 6, 14, 3], [...pastSprints[1], 34, 27, 7, 13, 4], [...pastSprints[2], 32, 31, 5, 15, 2],
  [...pastSprints[3], 36, 29, 8, 14, 4], [...pastSprints[4], 35, 28, 6, 13, 3],
]), sprintCols));
write("capacity/team-b-sprints.csv", csv(sprintRows("Sprint", [
  [...pastSprints[0], 26, 24, 3, 11, 2], [...pastSprints[1], 28, 22, 5, 10, 3], [...pastSprints[2], 25, 25, 2, 12, 1],
  [...pastSprints[3], 27, 21, 6, 9, 3], [...pastSprints[4], 26, 23, 4, 11, 2],
]), sprintCols));
const ptoCols = ["person", "start", "end", "type"];
write("capacity/team-a-pto.csv", csv([
  { person: "eng-a2", start: "2026-08-24", end: "2026-08-28", type: "pto" },
  { person: "eng-a5", start: "2026-09-21", end: "2026-09-22", type: "pto" },
  { person: "eng-a7", start: "2026-10-22", end: "2026-10-22", type: "pto" },
  { person: "eng-a2", start: "2026-10-26", end: "2026-10-30", type: "pto" },
  { person: "eng-a4", start: "2026-10-19", end: "2026-10-20", type: "training" },
], ptoCols));
write("capacity/team-b-pto.csv", csv([
  { person: "eng-b3", start: "2026-09-01", end: "2026-09-04", type: "pto" },
  { person: "eng-b6", start: "2026-10-12", end: "2026-10-13", type: "pto" },
  { person: "eng-b1", start: "2026-10-26", end: "2026-10-28", type: "pto" },
], ptoCols));
write("capacity/team-a-oncall-next.csv", csv([
  { rotation: "Payments primary", start: "2026-10-19T09:00:00Z", end: "2026-10-26T09:00:00Z", member: "eng-a7" },
  { rotation: "Payments primary", start: "2026-10-26T09:00:00Z", end: "2026-11-02T09:00:00Z", member: "eng-a1" },
], ["rotation", "start", "end", "member"]));
write("capacity/team-b-oncall-next.csv", csv([
  { rotation: "Mobile primary", start: "2026-10-19T09:00:00Z", end: "2026-10-26T09:00:00Z", member: "eng-b2" },
  { rotation: "Mobile primary", start: "2026-10-26T09:00:00Z", end: "2026-11-02T09:00:00Z", member: "eng-b3" },
  { rotation: "Release duty", start: "2026-10-22T09:00:00Z", end: "2026-10-22T21:00:00Z", member: "eng-b5" },
  { rotation: "Release duty", start: "2026-10-29T09:00:00Z", end: "2026-10-29T21:00:00Z", member: "eng-b6" },
], ["rotation", "start", "end", "member"]));

// Onboarding: Team A's team template, and the EM's notes from a first 1:1 with a Team B joiner
// who starts on 2026-11-02 (no person file yet). Written last with no random draws.
write("notes/team-a/onboarding.md", `# Team A onboarding template

Used by onboarding-plan. Milestones are outcomes the new joiner agrees to, never activity counts.

## Before day 1
- Laptop, accounts and access to payments-api, the ledger dashboards and the payments-eng channel.
- Buddy named and introduced.

## First 30 days
- Local setup working; can run the payments-api tests.
- Read the ledger onboarding guide and the refunds v2 RFC.
- First change merged with a reviewer from the Ledger sub-team.
- Shadow one on-call week (no pager).

## By day 60
- Own a small, scoped change end to end (design note, code, rollout).
- Join the on-call rotation as secondary.
- Present one thing learned at the team demo.

## By day 90
- Own an area or service with the buddy as backup.
- Join the primary on-call rotation if they feel ready.
- Agree career goals for the next six months.

## Check-in questions
- What has been easier or harder than you expected?
- What do you wish you had known in week one?
- Where do you feel blocked, and who could help?
`);
write("onboarding/team-b-eng-b7-first-1-1.md", `Pre-start call with Engineer B7 (first 1:1 questions), notes by Manager B, 2026-10-15. B7 starts on 2026-11-02.

Role: Engineer (E3), iOS. Came from a web team; first native mobile role.

- How do you like to receive feedback? Written first, then a chat.
- How do you like recognition? In the team channel is fine.
- What does a great manager do for you? Tells me early when priorities change.
- What are you most excited to learn? SwiftUI and how app releases work.
- What worries you? Being slow while I learn Swift; release duty sounds stressful.
- Anything about how you work best? Pairing for the first weeks, then quiet focus time.
- Goals for the first quarter: ship a visible feature in the app; understand the release process.
`);

// Tech debt inputs: Team A git history in the fixed no-author format, file sizes, TODO counts,
// incident-to-file links and debt tickets; Team B debt tickets only (no git). Written last
// with no random draws: commits follow a fixed pattern.
const gitFiles = [
  ["src/payouts/worker.ts", 1240, 7, 5], ["src/payouts/batch_config.ts", 180, 4, 0], ["src/refunds/handler.ts", 860, 6, 2],
  ["src/refunds/webhooks.ts", 640, 5, 4], ["src/ledger/model.ts", 1500, 3, 1], ["src/ledger/export.ts", 520, 2, 3],
  ["src/api/pagination.ts", 210, 2, 0], ["src/api/errors.ts", 300, 3, 0], ["test/payouts/worker.test.ts", 700, 5, 0],
  ["docs/runbook.md", 400, 2, 0], ["src/currency/rounding.ts", 260, 3, 1], ["package.json", 90, 1, 0],
];
const gitLines = [];
for (let i = 0; i < 90; i++) {
  const d = new Date(Date.parse("2026-07-20T00:00:00Z") + Math.floor(i * 0.98) * DAY);
  if (d.getUTCDay() % 6 === 0) continue;
  const touched = gitFiles.filter(([, , weight], idx) => (i * 7 + idx * 3) % 10 < weight);
  if (!touched.length) continue;
  gitLines.push(`--${day(d)}`);
  for (const [path, size, weight] of touched) gitLines.push(`${(i * 13 + size) % 60 + weight}\t${(i * 5 + size) % 25}\t${path}`);
  gitLines.push("");
}
write("git/team-a-numstat.txt", gitLines.join("\n"));
write("git/team-a-sizes.csv", csv(gitFiles.map(([path, lines]) => ({ path, lines })), ["path", "lines"]));
write("git/team-a-todos.csv", csv(gitFiles.filter((f) => f[3] > 0).map(([path, , , count]) => ({ path, count })), ["path", "count"]));
write("git/team-a-incident-paths.csv", csv([
  { incident: "INC-TEAMA-7", path: "src/payouts/worker.ts" }, { incident: "INC-TEAMA-7", path: "src/payouts/batch_config.ts" },
  { incident: "INC-TEAMA-2", path: "src/payouts/worker.ts" }, { incident: "INC-TEAMA-6", path: "src/payouts/worker.ts" },
  { incident: "INC-TEAMA-1", path: "src/refunds/webhooks.ts" },
], ["incident", "path"]));
const debtCols = ["id", "title", "area", "state", "assignee", "cycle", "created_at", "completed_at", "estimate", "labels", "incidents", "url"];
const debtRow = (id, title, area, cycle, created, done, est, incidents) => ({
  id, title, area, state: done ? "Done" : "Backlog", assignee: done ? "Engineer A6" : "", cycle, created_at: created, completed_at: done,
  estimate: est, labels: "tech-debt", incidents, url: `https://linear.example.com/example-co/issue/${id}`,
});
write("debt/team-a-debt-issues.csv", csv([
  debtRow("ATL-D1", "Stream payout batches instead of loading them into memory", "payouts", "", "2026-07-15", "", 8, "INC-TEAMA-7;INC-TEAMA-2"),
  debtRow("ATL-D2", "Split the payout worker into fetch, build and send steps", "payouts", "", "2026-05-12", "", 13, "INC-TEAMA-6"),
  debtRow("ATL-D3", "Retire the v1 refunds webhook signer", "refunds", "", "2026-06-02", "", 5, "INC-TEAMA-1"),
  debtRow("ATL-D4", "Remove the legacy ledger export CSV path", "ledger", "", "2026-04-28", "", 3, ""),
  debtRow("ATL-D5", "Replace hand-rolled currency rounding with the shared library", "currency", "", "2026-09-30", "", "", ""),
  debtRow("ATL-D6", "Add limit check on batch size config", "payouts", "Cycle 9", "2026-07-15", "2026-08-14", 2, "INC-TEAMA-7"),
  debtRow("ATL-D7", "Delete dead pagination code paths", "api", "Cycle 10", "2026-08-03", "2026-08-28", 3, ""),
  debtRow("ATL-D8", "Upgrade the HTTP client and drop the retry shim", "api", "Cycle 11", "2026-08-20", "2026-09-16", 5, ""),
  debtRow("ATL-D9", "Flaky reconciliation tests: fix ordering", "ledger", "Cycle 12", "2026-09-01", "2026-09-30", 2, ""),
  debtRow("ATL-D10", "Move error codes into one table", "api", "Cycle 13", "2026-09-22", "2026-10-14", "", ""),
], debtCols));
write("debt/team-b-debt-issues.csv", csv([
  { key: "MOB-D1", summary: "Remove the old image cache", component: "images", status: "To Do", assignee: "", sprint: "", created: "2026-05-20", resolved: "", story_points: 5, labels: "tech-debt", incidents: "INC-TEAMB-2", url: "https://jira.example.com/browse/MOB-D1" },
  { key: "MOB-D2", summary: "Migrate the checkout sheet to the new payment SDK", component: "checkout", status: "To Do", assignee: "", sprint: "", created: "2026-07-25", resolved: "", story_points: 8, labels: "tech-debt", incidents: "INC-TEAMB-1;INC-TEAMB-3", url: "https://jira.example.com/browse/MOB-D2" },
  { key: "MOB-D3", summary: "Drop iOS 15 support code", component: "platform", status: "To Do", assignee: "", sprint: "", created: "2026-09-08", resolved: "", story_points: 3, labels: "tech-debt", incidents: "", url: "https://jira.example.com/browse/MOB-D3" },
  { key: "MOB-D4", summary: "Fix flaky UI tests on the login flow", component: "login", status: "Done", assignee: "Engineer B5", sprint: "Sprint 11", created: "2026-08-25", resolved: "2026-09-17", story_points: 3, labels: "tech-debt", incidents: "", url: "https://jira.example.com/browse/MOB-D4" },
  { key: "MOB-D5", summary: "Remove unused analytics events", component: "platform", status: "Done", assignee: "Engineer B1", sprint: "Sprint 13", created: "2026-09-29", resolved: "2026-10-15", story_points: 2, labels: "tech-debt", incidents: "", url: "https://jira.example.com/browse/MOB-D5" },
], ["key", "summary", "component", "status", "assignee", "sprint", "created", "resolved", "story_points", "labels", "incidents", "url"]));

// Calibration: Manager A's draft ratings and summaries for three reports, using the
// organisation's own scale. The EM's words are left with vague and personality language on
// purpose. Written last with no random draws.
write("calibration/team-a-drafts.md", `Calibration drafts, Manager A, review period 2026-04-20 to 2026-10-16.
Scale used by ExampleCo: Below expectations, Meets expectations, Exceeds expectations.

## Engineer A1 (E4)
Draft rating: Exceeds expectations
Claim: Ready to operate at E5 in technical design and mentoring.
Summary: A1 is a rock star. Wrote the refunds v2 RFC, led the July payout incident, and mentors A7 and A4. Always the first to help.

## Engineer A2 (E4)
Draft rating: Exceeds expectations
Claim: Strong senior engineer who drives cross-team decisions.
Summary: A2 is very strategic and a natural leader. Got Finance to agree on multi-currency rounding. Sometimes a bit abrasive in reviews.

## Engineer A3 (E3)
Draft rating: Below expectations
Claim: Not yet meeting E3 execution expectations.
Summary: A3 lacks polish and needs to step up. Two reverts in July. Has improved PR size since the written expectations in August.
`);

// Delegation: each EM's current task list. Written last with no random draws.
write("delegation/team-a-em-tasks.md", `Manager A's task list, week of 2026-10-19.

- Run the biweekly 1:1s with seven reports
- Write the Q4 performance reviews
- Approve the Q1 hiring plan and headcount ask
- Lead the refunds v2 launch readiness review (2026-10-28)
- Chair the cross-team API design review with Team B (monthly)
- Own the payments-eng on-call rota and swaps
- Write the weekly upward update
- Run the quarterly ledger architecture review
- Present at the engineering all-hands tech talk slot (2026-11-12)
- Triage the staging ledger disk alerts with infra
- Interview loop calibration for the Senior Engineer role
- Mentor the new joiner on payments domain basics
`);
write("delegation/team-b-em-tasks.md", `Manager B's task list, week of 2026-10-19.

- Run the weekly 1:1s with six reports
- Write the Q4 performance reviews
- Run the weekly app release go/no-go
- Own the release-duty rota
- Write the weekly upward update
- Coordinate the iOS 18 crash fix with QA
- Plan the Q1 roadmap with product
- Represent Team B in the mobile guild
`);

// Team pulse: anonymous check-in exports (scores 1 to 5 per Maslach area). Team A's October has
// only 3 responses, so it must be suppressed. Team B's export wrongly includes an email column,
// which must be ignored. Written last with no random draws.
const pulseCols = ["period", "workload", "control", "reward", "community", "fairness", "values", "comment"];
const pr = (period, scores, comment = "") => {
  const [workload, control, reward, community, fairness, values] = scores;
  return { period, workload, control, reward, community, fairness, values, comment };
};
write("pulse/team-a-pulse.csv", csv([
  pr("2026-08", [4, 4, 3, 5, 4, 4]), pr("2026-08", [3, 4, 3, 4, 4, 5], "Refunds v2 feels like a good bet for the team"),
  pr("2026-08", [4, 3, 4, 5, 3, 4]), pr("2026-08", [3, 4, 3, 4, 4, 4]), pr("2026-08", [4, 5, 3, 5, 4, 4]),
  pr("2026-08", [3, 3, 2, 4, 3, 4], "End of cycle pushes make merges feel rushed"),
  pr("2026-09", [2, 3, 3, 4, 3, 4], "The staging ledger disk keeps filling up and eats whole afternoons"),
  pr("2026-09", [3, 4, 3, 4, 4, 4]), pr("2026-09", [2, 3, 2, 4, 3, 4], "Too many interrupts from the payout alerts"),
  pr("2026-09", [2, 3, 3, 5, 3, 4]), pr("2026-09", [3, 3, 3, 4, 4, 5]),
  pr("2026-10", [2, 3, 3, 4, 3, 4], "On-call weeks leave no room for planned work"),
  pr("2026-10", [1, 2, 3, 4, 3, 4]), pr("2026-10", [2, 3, 2, 4, 3, 4]),
], pulseCols));
write("pulse/team-b-pulse.csv", csv([
  ...[["2026-08", [3, 3, 3, 4, 3, 4], "Release duty on top of feature work is a lot"], ["2026-08", [4, 3, 3, 4, 4, 4], ""], ["2026-08", [3, 2, 3, 3, 3, 4], "Priorities change without notice"], ["2026-08", [4, 3, 4, 4, 3, 4], ""], ["2026-08", [3, 3, 3, 4, 3, 3], ""],
    ["2026-09", [3, 3, 3, 4, 3, 4], ""], ["2026-09", [3, 2, 3, 4, 2, 4], "Planning runs long and the outcome changes anyway"], ["2026-09", [4, 3, 3, 4, 3, 4], ""], ["2026-09", [3, 3, 3, 3, 3, 4], ""], ["2026-09", [2, 3, 3, 4, 3, 4], "The checkout crash week was exhausting"], ["2026-09", [3, 3, 4, 4, 3, 4], ""],
    ["2026-10", [3, 4, 3, 4, 4, 4], "Earlier notice on roadmap changes has helped"], ["2026-10", [3, 4, 3, 4, 3, 4], ""], ["2026-10", [4, 3, 3, 4, 4, 4], ""], ["2026-10", [3, 4, 3, 5, 4, 4], ""], ["2026-10", [3, 3, 4, 4, 3, 4], "Timeboxed planning is much better"]]
    .map(([p, sc, c], i) => ({ respondent_email: `eng-b${(i % 6) + 1}@team-b.example`, ...pr(p, sc, c) })),
], ["respondent_email", ...pulseCols]));

// RFC review inputs: a Team A RFC with gaps on purpose, CODEOWNERS for both repos, and a Team B
// RFC plus notes on what shipped, for the drift check. Written last with no random draws.
write("rfc/team-a-ledger-export-v2.md", `# RFC: Ledger export v2

Author: Engineer A7. Status: In review. Created 2026-10-12.

## Summary
Replace the nightly ledger CSV export with an incremental export that Finance can pull every hour.

## Background
Finance reconciles payouts from a CSV that is generated at 02:00 UTC. When a payout batch fails late in the day, Finance cannot see it until the next morning. The legacy CSV path also has three open TODOs and fails about once a month.

## Proposal
- Add an export table keyed by ledger entry id and updated_at.
- Expose an authenticated endpoint that returns entries changed since a cursor.
- Keep the nightly CSV running in parallel for one month, then remove it.
- Files touched: src/ledger/export.ts, src/ledger/model.ts, src/api/routes/finance.ts.

## Open questions
- Should the endpoint page by count or by time window?
- Who in Finance signs off on the field list?

## Alternatives considered
- Streaming entries to Finance's warehouse directly. Rejected: Finance has no streaming ingest.
`);
write("rfc/CODEOWNERS", `# CODEOWNERS (synthetic)
/src/ledger/            @example-co/payments-ledger
/src/payouts/           @example-co/payments-ledger
/src/api/               @example-co/payments-api
/src/api/routes/finance.ts  @example-co/payments-api @example-co/finance-eng
/docs/                  @example-co/payments-api
/ios/                   @example-co/mobile-ios
/android/               @example-co/mobile-android
/shared/images/         @example-co/mobile-ios @example-co/mobile-android
`);
write("rfc/team-b-image-cache-rfc.md", `# RFC: Replace the image cache

Author: Engineer B6. Status: Accepted 2026-08-20.

## Summary
Replace the custom image cache with the platform cache on iOS and Android.

## Problem
The custom cache causes the iOS 18 login loop when it is cleared during sign-in (INC-TEAMB-2), and it has no size limit.

## Proposal
- Use the platform cache with a 200 MB limit.
- Remove the custom cache code in /shared/images/.
- Roll out behind the image-cache-v2 flag to 10%, then 50%, then 100% over two weeks.

## Success criteria
- No login loops linked to the image cache for 30 days after full rollout.
- Cache size stays under 200 MB on 99% of devices.

## Rollout and rollback
Flag-based. Roll back by turning the flag off.

## Risks
- Offline images may load more slowly on first launch.
`);
write("rfc/team-b-image-cache-shipped.md", `What shipped for "Replace the image cache", notes by Manager B, 2026-10-16.

- iOS moved to the platform cache with a 250 MB limit (raised from 200 MB after testing).
- Android is still on the custom cache; the change is planned for Sprint 15.
- The rollout went 10% then 100% in one week; the 50% step was skipped.
- The custom cache code in /shared/images/ is still in the repo because Android uses it.
- No login loops linked to the image cache since 2026-09-20.
`);

// Roadmap demand for next quarter, input for headcount-case. Team-level only. No random draws.
write("headcount/team-a-roadmap.csv", csv([
  { initiative: "Refunds v2 rollout", quarter: "2027-Q1", estimate_points: 34, commitment: "committed", source: "Q1 planning doc" },
  { initiative: "Ledger export v2", quarter: "2027-Q1", estimate_points: 26, commitment: "committed", source: "RFC ledger export v2" },
  { initiative: "Payout worker hardening", quarter: "2027-Q1", estimate_points: 21, commitment: "committed", source: "debt register" },
  { initiative: "Multi-currency payouts", quarter: "2027-Q1", estimate_points: 55, commitment: "committed", source: "Q1 planning doc" },
  { initiative: "Partner API v1", quarter: "2027-Q1", estimate_points: 40, commitment: "proposed", source: "sales request" },
], ["initiative", "quarter", "estimate_points", "commitment", "source"]));
write("headcount/team-b-roadmap.csv", csv([
  { initiative: "Payment SDK migration (MOB-D2)", quarter: "2027-Q1", estimate_points: 8, commitment: "committed", source: "debt register" },
  { initiative: "Android image cache move", quarter: "2027-Q1", estimate_points: 13, commitment: "committed", source: "image cache RFC" },
  { initiative: "Offline mode v2", quarter: "2027-Q1", estimate_points: 48, commitment: "committed", source: "Q1 planning doc" },
  { initiative: "Checkout redesign", quarter: "2027-Q1", estimate_points: 40, commitment: "committed", source: "Q1 planning doc" },
  { initiative: "Tablet layouts", quarter: "2027-Q1", estimate_points: 21, commitment: "proposed", source: "product request" },
], ["initiative", "quarter", "estimate_points", "commitment", "source"]));

// Feedback observations: the EM's own words, input for feedback-rehearsal. No random draws.
write("feedback/team-a-eng-a2.md", `Observation from Manager A about Engineer A2, written 2026-10-19.

A2's code review comments on a teammate's ledger PRs have been really harsh lately. On 2026-10-08 they left 14 comments on one PR, and several just said "no" or "wrong" with no reason. The teammate told me in their 1:1 on 2026-10-15 that they now wait for someone else to review their work, which slowed the refunds change by two days. A2 is a bit abrasive and always thinks they know best. I want A2 to explain the why in reviews, because they want to be a tech lead.
`);
write("feedback/team-b-eng-b4.md", `Observation from Manager B about Engineer B4, written 2026-10-19.

B4 skipped the "flags off" step of the release checklist on 2026-10-14, so build 4.12 went out with the new checkout flag on, and we rolled it back two hours later. B4 seems distracted lately and is not really a team player. I need them to follow the checklist every release.
`);

// Team A keeps underperformance records in a separate file (expectations_storage above).
// Team B has not chosen yet, so underperformance-record asks on first use. No random draws.
const a3Records = [
  { id: "exp-a3-2026-08-11", kind: "expectation", date: "2026-08-11", how: "1:1", in_writing: false, text: "PRs under 300 lines; ask for help after half a day stuck; update the ticket daily." },
  { id: "fu-a3-2026-08-11", kind: "follow_up", date: "2026-08-11", how: "email summary after the 1:1", in_writing: true, text: "Sent the three expectations in writing." },
  { id: "sup-a3-2026-08-11", kind: "support", date: "2026-08-11", how: "1:1", in_writing: false, text: "Checklist before merge; stopped the end-of-cycle push." },
  { id: "wb-a3-2026-09-08", kind: "wellbeing_raised", date: "2026-09-08", how: "1:1", in_writing: false, text: "" },
  { id: "sup-a3-2026-09-08", kind: "support", date: "2026-09-08", how: "1:1", in_writing: false, text: "Reminded of the employee assistance programme and flexible hours; offered to lighten on-call." },
  { id: "prog-a3-2026-09-22", kind: "progress", date: "2026-09-22", how: "1:1", in_writing: false, text: "PR sizes are down. Still slow to ask for help." },
  { id: "sup-a3-2026-09-22", kind: "support", date: "2026-09-22", how: "1:1", in_writing: false, text: "Daily 10-minute check-in for two weeks." },
];
const FENCE = "`".repeat(3);
const expectationBlock = (r) => {
  const fields = { id: r.id, person: "eng-a3", kind: r.kind, date: r.date, how: r.how, in_writing: r.in_writing, text: r.text, link: null, captured: r.date };
  const lines = Object.entries(fields).map(([k, v]) => `${k}: ${v === null ? "null" : typeof v === "string" ? JSON.stringify(v) : v}`);
  return `${FENCE}yaml expectation\n${lines.join("\n")}\n${FENCE}`;
};
write("notes/team-a/people/eng-a3.expectations.md", `---
person: eng-a3
record: expectations
---

# Engineer A3: expectations record

Append-only. Facts and dates in the EM's words. Not a verdict.

## Expectations

${a3Records.map(expectationBlock).join("\n\n")}
`);

write("README.md", `# em-tools fixtures

Synthetic data for two invented teams at an invented company, ExampleCo. Nothing here describes real people or real systems. Regenerate with \`node scripts/generate-fixtures.mjs\` (deterministic).

Window: ${day(START)} to ${day(END)} (26 weeks). Calendar runs to 2026-10-30 so upcoming 1:1s exist. Examples treat ${TODAY} as today.

| Team | EM | Engineers | Tracker | Calendar | Chat | AI tool | PRs | Deploys |
|---|---|---|---|---|---|---|---|---|
${readme.join("\n")}

15 people in total: 2 EMs and 13 engineers.

## Personas

| Person | Team | What the fixtures show |
|---|---|---|
| Engineer A3 | Team A | Struggling engineer: reverts in July, written expectations in August, a wellbeing mention, cancelled 1:1s |
| Engineer A1 | Team A | Promotion candidate (E4 to E5): refunds v2 RFC, incident lead, mentoring, gap on cross-team direction |
| Engineer A4 | Team A | New joiner from 2026-08-24 with a 30/60/90 plan and no next 1:1 booked |
| Engineer A2, Engineer A5 | Team A | Heavy AI tool users |
| Engineer A7, Engineer A6 | Team A | Light AI tool users |
| Engineer B2 | Team B | Heavy AI tool user |
| Engineer B4 | Team B | Light AI tool user; four cancelled 1:1s while covering releases |

## Things to look for

- **Cross-team dependency:** Team B's refunds screen (Jira, labelled blocked) waits on Team A issue ATL-REFUND-V2 (Linear), which slipped from 2026-10-09 to 2026-10-23.
- **Minimum group size:** Team B's iOS sub-team has 3 people, so ai-adoption holds back its results. Team A's Ledger sub-team has 4 people, but the rest of Team A is 3, so it is held back too, because subtracting it from the team total would expose them.
- **Items gone quiet:** three In Progress issues per team with no update for 10 or more days.

## Files

| Folder | Contents |
|---|---|
| github/ | PRs (with AI-assisted labels, reverts, churn), reviews given, deployments |
| linear/ | Team A issues |
| jira/ | Team B issues |
| calendar/ | Team A Google Calendar and Team B Outlook exports (CSV) |
| slack/, teams/ | Public channel messages with decisions and blockers |
| incidents/ | Incident list per team |
| ai/ | AI tool usage by person and day (input only; outputs never show it per person) and monthly spend |
| pagerduty/, incident-io/ | On-call shifts and pages: Team A in PagerDuty format (one weekly rotation), Team B in incident.io format (a weekly rotation and a 3-person release-duty rotation) |
| postmortem/ | One incident channel export per team (Team A Slack, Team B Teams) that names people and includes one blaming message on purpose, plus each team's postmortem actions with owner names that must not appear in outputs |
| hiring/ | Team A's interviewer pool for a Senior Engineer role. The role's loop plan and two candidates' written scorecards (codes only, no score fields; cand-c2 is missing its collaboration scorecard) are in notes/team-a/hiring/ |
| capacity/ | Past sprint totals (planned, completed and unplanned work), PTO by person and date (input only; outputs count person-days), and the published on-call schedule for the next sprint, 2026-10-19 to 2026-10-30 |
| onboarding/ | The EM's notes from a pre-start call (first 1:1 questions) with a Team B joiner who has no person file yet. Team A's onboarding template is in notes/team-a/onboarding.md |
| git/ | Team A's payments-api history in the fixed no-author \`git log --numstat --format=--%cs\` format, file sizes, TODO and FIXME counts, and incident-to-file links |
| debt/ | Debt-labelled tickets for both teams (assignees present on purpose; outputs must not use them) |
| calibration/ | Manager A's draft ratings, claims and summaries for three reports, with vague and coded words left in on purpose |
| delegation/ | Each EM's current task list (Team A reports have specific career goals; Team B's goals are generic, so matches should not be invented) |
| pulse/ | Anonymous check-in exports on the six Maslach areas. Team A's October has only 3 responses (must be suppressed); Team B's export wrongly includes an email column (must be ignored). Outputs must never quote comments |
| headcount/ | Next quarter's roadmap demand for both teams, in points, with committed and proposed items, for headcount-case |
| rfc/ | A Team A RFC with gaps on purpose, CODEOWNERS for both repos, and a Team B RFC with notes on what shipped, for the drift check |
| feedback/ | Two EM observations written in the EM's own words, with judgement and coded words left in on purpose, for feedback-rehearsal |
| notes/team-a/, notes/team-b/ | Each EM's notes folder: team.md, ladder.md (Team A only), one file per person, last week's update. Team A keeps Engineer A3's expectations record in a separate file; Team B has not chosen where records go |
`);
console.log("fixtures written to", ROOT);
