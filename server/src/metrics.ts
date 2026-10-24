// Team-level metric maths. Every function returns aggregates only: no per-person rows,
// no rankings. Proxies are named in the `method` notes of each result.

export const MIN_GROUP_SIZE = 4;

type Row = Record<string, unknown>;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export function toDate(v: unknown): Date | null {
  if (v === undefined || v === null || v === "") return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  return ["true", "yes", "1", "y"].includes(String(v ?? "").trim().toLowerCase());
}

function toNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function list(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  return String(v ?? "").split(/[;,|]/).map((s) => s.trim()).filter(Boolean);
}

export function quantile(values: number[], q: number): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

function round(n: number | null, dp = 1): number | null {
  return n === null ? null : Math.round(n * 10 ** dp) / 10 ** dp;
}

function summary(hours: number[]) {
  return { n: hours.length, median_hours: round(quantile(hours, 0.5)), p75_hours: round(quantile(hours, 0.75)) };
}

export function weekStart(d: Date): string {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (x.getUTCDay() + 6) % 7;
  x.setUTCDate(x.getUTCDate() - dow);
  return x.toISOString().slice(0, 10);
}

function inWindow(d: Date | null, from?: string, to?: string): boolean {
  if (!d) return false;
  if (from && d < new Date(from)) return false;
  if (to && d >= new Date(new Date(to).getTime() + DAY)) return false;
  return true;
}

const FAILURE_LABELS = ["revert", "hotfix", "rollback", "incident"];

function isFailureFix(pr: Row): boolean {
  const labels = list(pr.labels).map((l) => l.toLowerCase());
  const title = String(pr.title ?? "").toLowerCase();
  return labels.some((l) => FAILURE_LABELS.some((f) => l.includes(f))) || /^(revert|hotfix|rollback)\b/.test(title);
}

// PR flow ---------------------------------------------------------------------

export function prFlow(prs: Row[], opts: { from?: string; to?: string; now?: string } = {}) {
  const now = toDate(opts.now) ?? new Date();
  const merged = prs.filter((p) => inWindow(toDate(p.merged_at), opts.from, opts.to));
  const pickup: number[] = [];
  const review: number[] = [];
  const cycle: number[] = [];
  const sizes: number[] = [];
  const weekly: Record<string, { merged: number; cycle: number[] }> = {};
  for (const p of merged) {
    const c = toDate(p.created_at)!;
    const m = toDate(p.merged_at)!;
    const r = toDate(p.first_review_at);
    if (c) cycle.push((m.getTime() - c.getTime()) / HOUR);
    if (c && r) pickup.push((r.getTime() - c.getTime()) / HOUR);
    if (r) review.push((m.getTime() - r.getTime()) / HOUR);
    sizes.push(toNum(p.additions) + toNum(p.deletions));
    const w = weekStart(m);
    weekly[w] ??= { merged: 0, cycle: [] };
    weekly[w].merged++;
    if (c) weekly[w].cycle.push((m.getTime() - c.getTime()) / HOUR);
  }
  const open = prs.filter((p) => !toDate(p.merged_at) && !toDate(p.closed_at) && !toBool(p.is_draft));
  const waiting = open.filter((p) => !toDate(p.first_review_at) && (now.getTime() - (toDate(p.created_at)?.getTime() ?? now.getTime())) > DAY);
  const bands = { "0-50": 0, "51-200": 0, "201-500": 0, "501+": 0 };
  for (const s of sizes) bands[s <= 50 ? "0-50" : s <= 200 ? "51-200" : s <= 500 ? "201-500" : "501+"]++;
  return {
    merged_prs: merged.length,
    pickup_time: summary(pickup),
    review_time: summary(review),
    cycle_time: summary(cycle),
    pr_size_lines: { median: round(quantile(sizes, 0.5), 0), p75: round(quantile(sizes, 0.75), 0), bands },
    open_prs: open.length,
    waiting_for_first_review_over_24h: waiting.map((p) => ({ number: p.number, title: p.title, repo: p.repo ?? null })),
    weekly: Object.keys(weekly).sort().map((w) => ({ week: w, merged: weekly[w].merged, median_cycle_hours: round(quantile(weekly[w].cycle, 0.5)) })),
    method: [
      "Pickup time: PR opened to first review. Review time: first review to merge. Cycle time: PR opened to merge.",
      "PR size: additions plus deletions.",
      "Team aggregates only; authors are not reported.",
    ],
  };
}

// DORA ------------------------------------------------------------------------

export function dora(deploys: Row[], prs: Row[], opts: { from?: string; to?: string; failureWindowHours?: number; incidents?: Row[] } = {}) {
  const windowH = opts.failureWindowHours ?? 48;
  const ds = deploys
    .filter((d) => (String(d.status ?? "success").toLowerCase() === "success") && inWindow(toDate(d.deployed_at), opts.from, opts.to))
    .map((d) => ({ ...d, at: toDate(d.deployed_at)! }))
    .sort((a, b) => a.at.getTime() - b.at.getTime());
  const mergedPrs = prs
    .map((p): Row & { merged: Date | null; first: Date | null } => ({ ...p, merged: toDate(p.merged_at), first: toDate(p.first_commit_at) ?? toDate(p.created_at) }))
    .filter((p) => p.merged);

  // Lead time: first commit to the first successful deploy at or after merge.
  const lead: number[] = [];
  const deployOf = new Map<unknown, number>();
  for (const p of mergedPrs) {
    const idx = ds.findIndex((d) => d.at >= p.merged!);
    if (idx === -1) continue;
    deployOf.set(p.number, idx);
    if (inWindow(p.merged, opts.from, opts.to) && p.first) lead.push((ds[idx].at.getTime() - p.first.getTime()) / HOUR);
  }

  // Change failure proxy: a deploy is failed when a revert, hotfix or rollback PR merges within the window after it,
  // or an incident starts within the window after it.
  const fixes = mergedPrs.filter(isFailureFix);
  const incidentStarts = (opts.incidents ?? []).map((i) => toDate(i.started_at)).filter((d): d is Date => !!d);
  const failed: number[] = [];
  const recovery: number[] = [];
  ds.forEach((d, i) => {
    const next = ds[i + 1]?.at ?? new Date(8.64e15);
    const end = new Date(Math.min(d.at.getTime() + windowH * HOUR, next.getTime() + windowH * HOUR));
    const fix = fixes.find((f) => f.merged! > d.at && f.merged! <= end);
    const inc = incidentStarts.find((s) => s > d.at && s <= end);
    if (fix || inc) {
      failed.push(i);
      const fixDeployIdx = fix ? deployOf.get(fix.number) : undefined;
      if (fixDeployIdx !== undefined && fixDeployIdx > i) recovery.push((ds[fixDeployIdx].at.getTime() - d.at.getTime()) / HOUR);
    }
  });

  // Rework rate: deploys that ship a revert, hotfix or rollback PR, over all deploys.
  const reworkDeploys = new Set<number>();
  for (const f of fixes) {
    const idx = deployOf.get(f.number);
    if (idx !== undefined) reworkDeploys.add(idx);
  }

  const weeks = new Set(ds.map((d) => weekStart(d.at)));
  const spanWeeks = opts.from && opts.to ? Math.max(1, Math.round((new Date(opts.to).getTime() - new Date(opts.from).getTime() + DAY) / (7 * DAY))) : Math.max(1, weeks.size);
  const weekly: Record<string, number> = {};
  for (const d of ds) weekly[weekStart(d.at)] = (weekly[weekStart(d.at)] ?? 0) + 1;

  return {
    deployments: ds.length,
    deployment_frequency_per_week: round(ds.length / spanWeeks, 2),
    change_lead_time: summary(lead),
    change_fail_rate_proxy: ds.length ? round((failed.length / ds.length) * 100, 1) : null,
    failed_deployment_recovery_time_proxy: summary(recovery),
    deployment_rework_rate_proxy: ds.length ? round((reworkDeploys.size / ds.length) * 100, 1) : null,
    weekly_deployments: Object.keys(weekly).sort().map((w) => ({ week: w, deployments: weekly[w] })),
    method: [
      "Deployments: successful production deploys in the window.",
      "Change lead time: first commit (or PR open) to the first deploy at or after merge.",
      `Change fail rate is a PROXY: a deploy counts as failed when a revert, hotfix or rollback PR merges, or an incident starts, within ${windowH} hours after it.`,
      "Recovery time is a PROXY: failed deploy to the deploy that shipped the fix.",
      "Rework rate is a PROXY: deploys that shipped a revert, hotfix or rollback PR, over all deploys.",
      "Track the team's own trend. Do not compare teams or set targets on these numbers.",
    ],
  };
}

// Meeting load ----------------------------------------------------------------

export function meetingLoad(events: Row[], members: string[], opts: { from: string; to: string; workdayStartHour?: number; workdayEndHour?: number; timezoneOffsetMinutes?: number }) {
  const team = new Set(members.map((m) => m.toLowerCase()));
  const startH = opts.workdayStartHour ?? 9;
  const endH = opts.workdayEndHour ?? 17;
  const offset = (opts.timezoneOffsetMinutes ?? 0) * 60_000;
  const from = new Date(opts.from);
  const to = new Date(new Date(opts.to).getTime() + DAY);
  const workdays: string[] = [];
  for (let d = new Date(from); d < to; d = new Date(d.getTime() + DAY)) if (d.getUTCDay() % 6 !== 0) workdays.push(d.toISOString().slice(0, 10));
  const weeks = workdays.length / 5;

  // Busy intervals per member per day, in local minutes.
  const busy = new Map<string, Array<[number, number]>>();
  let personHours = 0;
  let afterHours = 0;
  const recurring: Record<string, { hours: number; occurrences: number; attendees: number }> = {};
  for (const e of events) {
    const s = toDate(e.start);
    const f = toDate(e.end);
    if (!s || !f || f <= s || s < from || s >= to) continue;
    const attendees = list(e.attendees).map((a) => a.toLowerCase()).filter((a) => team.has(a));
    if (!attendees.length) continue;
    const ls = new Date(s.getTime() + offset);
    const lf = new Date(f.getTime() + offset);
    const hours = (f.getTime() - s.getTime()) / HOUR;
    personHours += hours * attendees.length;
    if (ls.getUTCHours() < startH || lf.getUTCHours() + lf.getUTCMinutes() / 60 > endH) afterHours++;
    if (toBool(e.recurring)) {
      const key = String(e.title ?? "untitled");
      recurring[key] ??= { hours: 0, occurrences: 0, attendees: 0 };
      recurring[key].hours += hours * attendees.length;
      recurring[key].occurrences++;
      recurring[key].attendees = Math.max(recurring[key].attendees, attendees.length);
    }
    const day = ls.toISOString().slice(0, 10);
    const a = ls.getUTCHours() * 60 + ls.getUTCMinutes();
    const b = lf.getUTCHours() * 60 + lf.getUTCMinutes();
    for (const m of attendees) {
      const k = `${m}|${day}`;
      if (!busy.has(k)) busy.set(k, []);
      busy.get(k)!.push([a, b]);
    }
  }

  // Focus: share of member-workdays with at least one free 2-hour block in working hours.
  let focusDays = 0;
  let memberDays = 0;
  for (const m of team) {
    for (const day of workdays) {
      memberDays++;
      const iv = (busy.get(`${m}|${day}`) ?? []).sort((x, y) => x[0] - y[0]);
      let cursor = startH * 60;
      let best = 0;
      for (const [a, b] of iv) {
        best = Math.max(best, Math.min(a, endH * 60) - cursor);
        cursor = Math.max(cursor, b);
      }
      best = Math.max(best, endH * 60 - cursor);
      if (best >= 120) focusDays++;
    }
  }

  return {
    team_size: team.size,
    workdays: workdays.length,
    meeting_hours_per_person_per_week: team.size && weeks ? round(personHours / team.size / weeks) : null,
    share_of_days_with_2h_focus_block: memberDays ? round((focusDays / memberDays) * 100, 0) : null,
    meetings_outside_working_hours: afterHours,
    top_recurring_meetings_by_team_hours: Object.entries(recurring)
      .sort((x, y) => y[1].hours - x[1].hours)
      .slice(0, 5)
      .map(([title, r]) => ({ title, team_hours: round(r.hours), occurrences: r.occurrences, team_attendees: r.attendees })),
    method: [
      `Working hours ${startH}:00 to ${endH}:00, weekdays only.`,
      "Meeting hours are summed over team attendees and averaged per person per week.",
      "Focus share: member-workdays with at least one free 2-hour block in working hours.",
      "Team averages only; no per-person calendar figures are reported.",
    ],
  };
}

// AI adoption -----------------------------------------------------------------

export interface GroupResult {
  group: string;
  size: number;
  suppressed: boolean;
  reason?: string;
  [k: string]: unknown;
}

// A group is shown only if it has at least MIN_GROUP_SIZE people and, when it sits inside the
// whole team, the rest of the team is either empty or also at least MIN_GROUP_SIZE. Otherwise
// subtracting it from the team total would expose a smaller group.
export function suppression(groupSize: number, teamSize: number, isWholeTeam: boolean): string | null {
  if (groupSize < MIN_GROUP_SIZE) return `Group has ${groupSize} people; results show only for groups of ${MIN_GROUP_SIZE} or more.`;
  const rest = teamSize - groupSize;
  if (!isWholeTeam && rest > 0 && rest < MIN_GROUP_SIZE) return `Showing this group would expose the other ${rest} people in the team by subtraction.`;
  return null;
}

export function aiAdoption(input: {
  groups: Record<string, string[]>;
  usage: Row[];
  prs: Row[];
  spend?: Row[];
  from?: string;
  to?: string;
}) {
  const allMembers = [...new Set(Object.values(input.groups).flat().map((m) => m.toLowerCase()))];
  const teamSize = allMembers.length;
  const usage = input.usage.filter((u) => inWindow(toDate(u.date), input.from, input.to));
  const prs = input.prs.filter((p) => inWindow(toDate(p.merged_at), input.from, input.to));

  const results: GroupResult[] = [];
  for (const [name, rawMembers] of Object.entries(input.groups)) {
    const members = new Set(rawMembers.map((m) => m.toLowerCase()));
    const isWholeTeam = members.size === teamSize;
    const reason = suppression(members.size, teamSize, isWholeTeam);
    if (reason) {
      results.push({ group: name, size: members.size, suppressed: true, reason });
      continue;
    }
    const activeDays = new Map<string, Set<string>>();
    for (const u of usage) {
      const p = String(u.person ?? "").toLowerCase();
      if (!members.has(p) || (u.active !== undefined && !toBool(u.active))) continue;
      if (!activeDays.has(p)) activeDays.set(p, new Set());
      activeDays.get(p)!.add(String(u.date).slice(0, 10));
    }
    const perPerson = [...members].map((m) => activeDays.get(m)?.size ?? 0);
    const weeklyActive: Record<string, Set<string>> = {};
    for (const u of usage) {
      const p = String(u.person ?? "").toLowerCase();
      if (!members.has(p) || (u.active !== undefined && !toBool(u.active))) continue;
      const w = weekStart(toDate(u.date)!);
      weeklyActive[w] ??= new Set();
      weeklyActive[w].add(p);
    }

    const groupPrs = prs.filter((p) => members.has(String(p.author ?? "").toLowerCase()));
    const ai = groupPrs.filter((p) => toBool(p.ai_assisted));
    const other = groupPrs.filter((p) => !toBool(p.ai_assisted));
    const authors = (xs: Row[]) => new Set(xs.map((p) => String(p.author).toLowerCase())).size;
    const compare = (xs: Row[]) => {
      if (authors(xs) < MIN_GROUP_SIZE) return { suppressed: true, reason: `Fewer than ${MIN_GROUP_SIZE} authors in this set.`, prs: xs.length };
      const cycle = xs.map((p) => toDate(p.merged_at) && toDate(p.created_at) ? (toDate(p.merged_at)!.getTime() - toDate(p.created_at)!.getTime()) / HOUR : null).filter((x): x is number => x !== null);
      const reviews = xs.map((p) => toNum(p.review_comments));
      const sizes = xs.map((p) => toNum(p.additions) + toNum(p.deletions));
      const churned = xs.map((p) => toNum(p.churn_lines_21d));
      const added = xs.reduce((s, p) => s + toNum(p.additions), 0);
      return {
        suppressed: false,
        prs: xs.length,
        median_cycle_hours: round(quantile(cycle, 0.5)),
        median_review_comments: round(quantile(reviews, 0.5)),
        median_pr_size_lines: round(quantile(sizes, 0.5), 0),
        revert_rate_pct: round((xs.filter((p) => toBool(p.reverted)).length / xs.length) * 100, 1),
        defect_linked_rate_pct: round((xs.filter((p) => toBool(p.defect_linked)).length / xs.length) * 100, 1),
        churn_21d_pct_of_added: added ? round((churned.reduce((s, x) => s + x, 0) / added) * 100, 1) : null,
      };
    };

    results.push({
      group: name,
      size: members.size,
      suppressed: false,
      adoption_pct: round((perPerson.filter((d) => d > 0).length / members.size) * 100, 0),
      active_days_per_person: { median: quantile(perPerson, 0.5), p25: quantile(perPerson, 0.25), p75: quantile(perPerson, 0.75) },
      weekly_active_pct: Object.keys(weeklyActive).sort().map((w) => ({ week: w, active_pct: round((weeklyActive[w].size / members.size) * 100, 0) })),
      ai_assisted_pr_share_pct: groupPrs.length ? round((ai.length / groupPrs.length) * 100, 0) : null,
      ai_assisted_prs: compare(ai),
      other_prs: compare(other),
    });
  }

  const spendRows = (input.spend ?? []).filter((s) => !input.from || String(s.month) >= input.from.slice(0, 7)).filter((s) => !input.to || String(s.month) <= input.to.slice(0, 7));
  const byMonth: Record<string, number> = {};
  let currency: string | null = null;
  for (const s of spendRows) {
    byMonth[String(s.month)] = (byMonth[String(s.month)] ?? 0) + toNum(s.amount);
    currency ??= s.currency ? String(s.currency) : null;
  }
  const whole = results.find((r) => r.size === teamSize && !r.suppressed);
  const totalSpend = Object.values(byMonth).reduce((a, b) => a + b, 0);
  const aiPrs = whole && !(whole.ai_assisted_prs as { suppressed: boolean }).suppressed ? (whole.ai_assisted_prs as { prs: number }).prs : null;

  return {
    min_group_size: MIN_GROUP_SIZE,
    team_size: teamSize,
    groups: results,
    spend: {
      currency,
      by_month: Object.keys(byMonth).sort().map((m) => ({ month: m, amount: round(byMonth[m], 2) })),
      total: round(totalSpend, 2),
      per_team_member_per_month: teamSize && Object.keys(byMonth).length ? round(totalSpend / teamSize / Object.keys(byMonth).length, 2) : null,
      per_ai_assisted_pr: aiPrs ? round(totalSpend / aiPrs, 2) : null,
    },
    method: [
      `Groups under ${MIN_GROUP_SIZE} people are suppressed, and so is any group whose complement in the team is under ${MIN_GROUP_SIZE}.`,
      `AI-assisted and other PR comparisons are suppressed when they cover fewer than ${MIN_GROUP_SIZE} authors.`,
      "AI-assisted means an explicit signal only: a tool label such as claude-code-assisted, an AI co-author trailer, or the tool's own report.",
      "Correlation, not cause: compare the team with its own past, and read alongside review load and stability.",
      "No individual is named or ranked.",
    ],
  };
}

// Dependencies ----------------------------------------------------------------

export function workingDaysBetween(a: Date, b: Date): number {
  if (b <= a) return 0;
  let days = 0;
  const d = new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate()));
  const end = new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()));
  while (d < end) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) days++;
  }
  return days;
}

// Items, not people. Each row is one dependency: direction "we_wait" (we are blocked by another
// team) or "they_wait" (another team is blocked by us). Aging is in working days.
export function dependencyAge(rows: Row[], opts: { now?: string; agingDays?: number; staleDays?: number; finished?: Row[] } = {}) {
  const now = toDate(opts.now) ?? new Date();
  const aging = opts.agingDays ?? 5;
  const stale = opts.staleDays ?? 10;
  const open = rows.filter((r) => !toDate(r.resolved_at));
  const items = open
    .map((r) => {
      const since = toDate(r.since);
      const age = since ? workingDaysBetween(since, now) : null;
      return {
        id: r.id ?? null,
        title: r.title ?? null,
        direction: String(r.direction ?? "we_wait") === "they_wait" ? "they_wait" : "we_wait",
        other_team: r.other_team ?? null,
        since: since ? since.toISOString().slice(0, 10) : null,
        age_working_days: age,
        status: age === null ? "unknown" : age >= stale ? "stale" : age >= aging ? "aging" : "ok",
        link: r.link ?? null,
      };
    })
    .sort((a, b) => (b.age_working_days ?? -1) - (a.age_working_days ?? -1));
  const byTeam: Record<string, { we_wait: number; they_wait: number }> = {};
  for (const i of items) {
    const t = String(i.other_team ?? "unknown");
    byTeam[t] ??= { we_wait: 0, they_wait: 0 };
    byTeam[t][i.direction as "we_wait" | "they_wait"]++;
  }
  // Blocked share: working days blocked over working days in progress, for finished work.
  // Tickets with no blocked_days value are unknown, not zero, so they are left out of the share.
  let blocked = 0;
  let inProgress = 0;
  let withHistory = 0;
  let withoutHistory = 0;
  for (const f of opts.finished ?? []) {
    const s = toDate(f.started_at);
    const c = toDate(f.completed_at);
    if (!s || !c) continue;
    const raw = f.blocked_days;
    const value = raw === undefined || raw === null || String(raw).trim() === "" ? NaN : Number(raw);
    if (!Number.isFinite(value)) {
      withoutHistory++;
      continue;
    }
    withHistory++;
    inProgress += workingDaysBetween(s, c);
    blocked += value;
  }
  const ages = items.map((i) => i.age_working_days).filter((x): x is number => x !== null);
  return {
    open_dependencies: items.length,
    we_wait: items.filter((i) => i.direction === "we_wait").length,
    they_wait: items.filter((i) => i.direction === "they_wait").length,
    stale: items.filter((i) => i.status === "stale").length,
    aging: items.filter((i) => i.status === "aging").length,
    median_age_working_days: quantile(ages, 0.5),
    by_other_team: byTeam,
    items,
    blocked_share_of_cycle_time_pct: inProgress ? round((blocked / inProgress) * 100, 1) : null,
    finished_tickets_with_blocked_history: withHistory,
    finished_tickets_without_blocked_history: withoutHistory,
    method: [
      `Age is in working days from 'since' to now. Aging at ${aging} working days, stale at ${stale}.`,
      "Blocked share: days marked blocked on finished work over working days that work was in progress. Tickets with no blocked_days value are left out and counted separately, never treated as zero.",
      "Items only; owners are not reported.",
    ],
  };
}

// On-call health -----------------------------------------------------------------

// Per rotation, never per person. Shift rows give coverage and rotation size; the member field is
// only counted, never returned. Pages are compared per 12 on-call hours, the window the Google SRE
// guidance (at most about 2 incidents per 12-hour shift) assumes, whatever the shift length.
export function oncallHealth(pages: Row[], shifts: Row[], opts: { from?: string; to?: string; timezoneOffsetMinutes?: number; workdayStartHour?: number; workdayEndHour?: number } = {}) {
  const offset = (opts.timezoneOffsetMinutes ?? 0) * 60_000;
  const startH = opts.workdayStartHour ?? 9;
  const endH = opts.workdayEndHour ?? 17;
  const rotations = new Map<string, { members: Set<string>; shiftHours: number[]; coverage: Array<[number, number]> }>();
  for (const s of shifts) {
    const a = toDate(s.start);
    const b = toDate(s.end);
    if (!a || !b || b <= a) continue;
    if (!inWindow(a, opts.from, opts.to)) continue;
    const r = String(s.rotation ?? "unknown");
    if (!rotations.has(r)) rotations.set(r, { members: new Set(), shiftHours: [], coverage: [] });
    const rot = rotations.get(r)!;
    if (s.member) rot.members.add(String(s.member).toLowerCase());
    rot.shiftHours.push((b.getTime() - a.getTime()) / HOUR);
    rot.coverage.push([a.getTime(), b.getTime()]);
  }
  const results = [];
  for (const [name, rot] of rotations) {
    const ps = pages.filter((p) => String(p.rotation ?? "unknown") === name && inWindow(toDate(p.created_at), opts.from, opts.to));
    const oncallHours = rot.shiftHours.reduce((x, y) => x + y, 0);
    const offHours = ps.filter((p) => {
      const d = new Date(toDate(p.created_at)!.getTime() + offset);
      const h = d.getUTCHours() + d.getUTCMinutes() / 60;
      return d.getUTCDay() === 0 || d.getUTCDay() === 6 || h < startH || h >= endH;
    }).length;
    // 12-hour windows across covered time, counting windows with more than 2 pages.
    let windows = 0;
    let busyWindows = 0;
    for (const [a, b] of rot.coverage) {
      for (let t = a; t < b; t += 12 * HOUR) {
        windows++;
        const n = ps.filter((p) => {
          const c = toDate(p.created_at)!.getTime();
          return c >= t && c < Math.min(t + 12 * HOUR, b);
        }).length;
        if (n > 2) busyWindows++;
      }
    }
    const ack = ps
      .map((p) => (toDate(p.acknowledged_at) && toDate(p.created_at) ? (toDate(p.acknowledged_at)!.getTime() - toDate(p.created_at)!.getTime()) / 60_000 : null))
      .filter((x): x is number => x !== null);
    const noisy: Record<string, { count: number; unactionable: number }> = {};
    for (const p of ps) {
      const k = String(p.alert ?? p.title ?? "untitled");
      noisy[k] ??= { count: 0, unactionable: 0 };
      noisy[k].count++;
      if (p.actionable !== undefined && !toBool(p.actionable)) noisy[k].unactionable++;
    }
    const coveredFrom = Math.min(...rot.coverage.map(([a]) => a));
    const coveredTo = Math.max(...rot.coverage.map(([, b]) => b));
    const spanWeeks = opts.from && opts.to
      ? Math.max(1, (new Date(opts.to).getTime() - new Date(opts.from).getTime() + DAY) / (7 * DAY))
      : Math.max(1, (coveredTo - coveredFrom) / (7 * DAY));
    const size = rot.members.size;
    const small = size > 0 && size < MIN_GROUP_SIZE;
    const base = {
      rotation: name,
      size,
      shift_length_hours: round(quantile(rot.shiftHours, 0.5)),
      pages: ps.length,
      pages_per_week: round(ps.length / spanWeeks, 1),
      off_hours_share_pct: ps.length ? round((offHours / ps.length) * 100, 0) : null,
      top_alerts: Object.entries(noisy)
        .sort((x, y) => y[1].count - x[1].count)
        .slice(0, 10)
        .map(([alert, v]) => ({ alert, pages: v.count, unactionable: v.unactionable })),
    };
    if (small) {
      results.push({ ...base, small_rotation: true, note: `Rotation has ${size} people; per-window and response figures are held back below ${MIN_GROUP_SIZE}.` });
      continue;
    }
    results.push({
      ...base,
      small_rotation: false,
      oncall_hours: round(oncallHours, 0),
      average_share_of_time_on_call_pct: size ? round((oncallHours / size / (spanWeeks * 7 * 24)) * 100, 0) : null,
      incidents_per_12_oncall_hours: oncallHours ? round((ps.length / oncallHours) * 12, 2) : null,
      twelve_hour_windows: windows,
      windows_over_2_incidents: busyWindows,
      median_minutes_to_acknowledge: round(quantile(ack, 0.5), 0),
    });
  }
  return {
    rotations: results,
    method: [
      "Per rotation only. Shift members are counted for rotation size and never returned.",
      "Pages are compared per 12 on-call hours, and shifts of any length are split into 12-hour windows, because the Google SRE guidance (at most about 2 incidents per 12-hour shift, at most 25% of time on call) assumes 12-hour shifts.",
      `Off-hours: weekends or outside ${startH}:00 to ${endH}:00 in the given time zone.`,
      `Rotations under ${MIN_GROUP_SIZE} people show totals only.`,
      "No shift dates are returned, because a dated shift identifies who was on call.",
    ],
  };
}
