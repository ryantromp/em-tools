import { test } from "node:test";
import assert from "node:assert/strict";
import { actionAge, capacity, debtAllocation, hiringFunnel, hotspots, aiAdoption, dora, meetingLoad, prFlow, quantile, suppression } from "../src/metrics.ts";
import { parseCsv } from "../src/csv.ts";

test("quantile", () => {
  assert.equal(quantile([1, 2, 3, 4], 0.5), 2.5);
  assert.equal(quantile([], 0.5), null);
});

test("csv parser handles quotes", () => {
  const rows = parseCsv('a,b\n1,"x, ""y"""\n\n2,z\r\n');
  assert.deepEqual(rows, [{ a: "1", b: 'x, "y"' }, { a: "2", b: "z" }]);
});

test("pr flow never reports authors", () => {
  const r = prFlow([
    { number: 1, author: "a", created_at: "2026-10-01T09:00:00Z", first_review_at: "2026-10-01T11:00:00Z", merged_at: "2026-10-01T15:00:00Z", additions: 10, deletions: 5 },
    { number: 2, author: "b", created_at: "2026-10-02T09:00:00Z", first_review_at: "2026-10-03T09:00:00Z", merged_at: "2026-10-03T21:00:00Z", additions: 300, deletions: 50 },
    { number: 3, author: "c", created_at: "2026-10-05T09:00:00Z" },
  ], { now: "2026-10-08T09:00:00Z" });
  assert.equal(r.merged_prs, 2);
  assert.equal(r.cycle_time.median_hours, 21);
  assert.equal(r.pickup_time.median_hours, 13);
  assert.deepEqual(r.waiting_for_first_review_over_24h.map((p) => p.number), [3]);
  assert.ok(!JSON.stringify(r).includes('"author"'));
});

test("dora proxies", () => {
  const deploys = [
    { id: "d1", deployed_at: "2026-10-01T12:00:00Z" },
    { id: "d2", deployed_at: "2026-10-02T12:00:00Z" },
    { id: "d3", deployed_at: "2026-10-03T12:00:00Z" },
    { id: "d4", deployed_at: "2026-10-06T12:00:00Z" },
  ];
  const prs = [
    { number: 1, title: "Add search", created_at: "2026-09-30T09:00:00Z", merged_at: "2026-10-01T10:00:00Z" },
    { number: 2, title: "Revert search", labels: "revert", created_at: "2026-10-01T20:00:00Z", merged_at: "2026-10-02T10:00:00Z" },
  ];
  const r = dora(deploys, prs, { from: "2026-10-01", to: "2026-10-07" });
  assert.equal(r.deployments, 4);
  assert.equal(r.change_fail_rate_proxy, 25);
  assert.equal(r.deployment_rework_rate_proxy, 25);
  assert.equal(r.failed_deployment_recovery_time_proxy.median_hours, 24);
  assert.equal(r.change_lead_time.median_hours, 21.5);
  assert.ok(r.method.some((m) => m.includes("PROXY")));
});

test("meeting load is a team average", () => {
  const r = meetingLoad([
    { start: "2026-10-05T09:00:00Z", end: "2026-10-05T10:00:00Z", title: "Standup", attendees: "a@x;b@x", recurring: "true" },
    { start: "2026-10-05T11:00:00Z", end: "2026-10-05T16:00:00Z", title: "Workshop", attendees: "a@x" },
  ], ["a@x", "b@x"], { from: "2026-10-05", to: "2026-10-09" });
  assert.equal(r.meeting_hours_per_person_per_week, 3.5);
  assert.equal(r.share_of_days_with_2h_focus_block, 90);
  assert.equal(r.top_recurring_meetings_by_team_hours[0].title, "Standup");
});

test("suppression rules", () => {
  assert.match(suppression(3, 7, false)!, /3 people/);
  assert.equal(suppression(4, 8, false), null);
  assert.match(suppression(5, 8, false)!, /subtraction/);
  assert.equal(suppression(7, 7, true), null);
});

test("ai adoption suppresses small groups and never emits people", () => {
  const team = ["p1", "p2", "p3", "p4", "p5", "p6", "p7"];
  const usage = team.flatMap((p, i) => Array.from({ length: i + 1 }, (_, d) => ({ person: p, date: `2026-10-0${d + 1}`, active: "true" })));
  const prs = team.flatMap((p, i) => [
    { number: i * 2, author: p, created_at: "2026-10-01T00:00:00Z", merged_at: "2026-10-02T00:00:00Z", ai_assisted: i % 2 === 0 ? "true" : "false", additions: 100, deletions: 0, churn_lines_21d: 10 },
    { number: i * 2 + 1, author: p, created_at: "2026-10-01T00:00:00Z", merged_at: "2026-10-03T00:00:00Z", ai_assisted: "false", additions: 50, deletions: 0 },
  ]);
  const r = aiAdoption({ groups: { team, mobile: ["p1", "p2", "p3"] }, usage, prs, spend: [{ month: "2026-10", amount: 140, currency: "USD" }] });
  const t = r.groups.find((g) => g.group === "team")!;
  const m = r.groups.find((g) => g.group === "mobile")!;
  assert.equal(t.suppressed, false);
  assert.equal(t.adoption_pct, 100);
  assert.equal(m.suppressed, true);
  assert.equal(r.spend.per_team_member_per_month, 20);
  const text = JSON.stringify(r);
  for (const p of team) assert.ok(!text.includes(`"${p}"`), `leaked ${p}`);
});

test("dependency age in working days, items only", async () => {
  const { dependencyAge, workingDaysBetween } = await import("../src/metrics.ts");
  assert.equal(workingDaysBetween(new Date("2026-10-16T00:00:00Z"), new Date("2026-10-19T00:00:00Z")), 1);
  const r = dependencyAge([
    { id: "X-1", title: "Schema decision", direction: "we_wait", other_team: "Data", since: "2026-09-29", owner: "someone" },
    { id: "X-2", title: "Refund API", direction: "they_wait", other_team: "Team B", since: "2026-10-12" },
    { id: "X-3", title: "Done thing", direction: "we_wait", other_team: "Infra", since: "2026-09-01", resolved_at: "2026-09-10" },
  ], { now: "2026-10-19", finished: [
    { started_at: "2026-10-05", completed_at: "2026-10-19", blocked_days: 2 },
    { started_at: "2026-10-05", completed_at: "2026-10-19", blocked_days: "" },
  ] });
  assert.equal(r.open_dependencies, 2);
  assert.equal(r.items[0].id, "X-1");
  assert.equal(r.items[0].age_working_days, 14);
  assert.equal(r.items[0].status, "stale");
  assert.equal(r.items[1].status, "aging");
  assert.equal(r.blocked_share_of_cycle_time_pct, 20);
  assert.equal(r.finished_tickets_with_blocked_history, 1);
  assert.equal(r.finished_tickets_without_blocked_history, 1);
  assert.ok(!JSON.stringify(r).includes("someone"));
});

test("on-call health per rotation, small rotations totals only, no people or dates", async () => {
  const { oncallHealth } = await import("../src/metrics.ts");
  const members = ["m1", "m2", "m3", "m4"];
  const shifts: Array<Record<string, string>> = [];
  const day = (n: number) => new Date(Date.UTC(2026, 8, 7 + n, 9)).toISOString();
  for (let w = 0; w < 4; w++) shifts.push({ rotation: "primary", start: day(w * 7), end: day(w * 7 + 7), member: members[w] });
  for (let d = 0; d < 6; d++) shifts.push({ rotation: "release", start: `2026-09-${String(7 + d).padStart(2, "0")}T09:00:00Z`, end: `2026-09-${String(7 + d).padStart(2, "0")}T21:00:00Z`, member: ["r1", "r2", "r3"][d % 3] });
  const pages = [
    { rotation: "primary", created_at: "2026-09-08T02:00:00Z", acknowledged_at: "2026-09-08T02:10:00Z", alert: "disk", actionable: "false" },
    { rotation: "primary", created_at: "2026-09-08T03:00:00Z", acknowledged_at: "2026-09-08T03:04:00Z", alert: "disk", actionable: "false" },
    { rotation: "primary", created_at: "2026-09-08T04:00:00Z", acknowledged_at: "2026-09-08T04:06:00Z", alert: "api 5xx", actionable: "true" },
    { rotation: "primary", created_at: "2026-09-16T10:00:00Z", acknowledged_at: "2026-09-16T10:02:00Z", alert: "disk", actionable: "false" },
    { rotation: "release", created_at: "2026-09-08T10:00:00Z", alert: "crash", actionable: "true" },
  ];
  const r = oncallHealth(pages, shifts, { from: "2026-09-07", to: "2026-10-04" });
  const p = r.rotations.find((x) => x.rotation === "primary") as Record<string, any>;
  const s = r.rotations.find((x) => x.rotation === "release") as Record<string, any>;
  assert.equal(p.size, 4);
  assert.equal(p.shift_length_hours, 168);
  assert.equal(p.pages, 4);
  assert.equal(p.off_hours_share_pct, 75);
  assert.equal(p.windows_over_2_incidents, 1);
  assert.equal(p.twelve_hour_windows, 56);
  assert.equal(p.average_share_of_time_on_call_pct, 25);
  assert.equal(p.top_alerts[0].alert, "disk");
  assert.equal(p.top_alerts[0].unactionable, 3);
  assert.equal(s.small_rotation, true);
  assert.equal("windows_over_2_incidents" in s, false);
  const text = JSON.stringify(r);
  for (const m of [...members, "r1", "r2", "r3", "2026-09-14T09", "2026-09-07"]) assert.ok(!text.includes(m), `leaked ${m}`);
});

test("on-call edge cases from review", async () => {
  const { oncallHealth } = await import("../src/metrics.ts");
  // Overlap: a weekly shift starting before 'from' still counts, clipped to the window.
  // Four 2-day shifts from 6 to 14 September: the first starts before 'from', the last ends after 'to'.
  const shifts = ["a", "b", "c", "d"].map((m, w) => ({ rotation: "p", start: new Date(Date.UTC(2026, 8, 6 + w * 2, 9)).toISOString(), end: new Date(Date.UTC(2026, 8, 8 + w * 2, 9)).toISOString(), member: m }));
  const pages = [
    { rotation: "p", created_at: "2026-09-08T10:00:00Z", alert: "constructor", actionable: "" },
    { rotation: "p", created_at: "2026-09-08T11:00:00Z", alert: "toString", actionable: "false" },
    { rotation: "ghost", created_at: "2026-09-09T11:00:00Z", alert: "x" },
  ];
  const r = oncallHealth(pages, shifts, { from: "2026-09-07", to: "2026-09-13" }) as any;
  const p = r.rotations.find((x: any) => x.rotation === "p");
  assert.equal(p.small_rotation, false);
  assert.equal(p.oncall_hours, 168);
  assert.equal(p.pages_per_week, 2);
  const names = p.top_alerts.map((x: any) => x.alert).sort();
  assert.deepEqual(names, ["constructor", "toString"]);
  const c = p.top_alerts.find((x: any) => x.alert === "constructor");
  assert.equal(c.unactionable, 0);
  assert.equal(c.actionability_unknown, 1);
  // Pages with no schedule are reported, totals only.
  const g = r.rotations.find((x: any) => x.rotation === "ghost");
  assert.equal(g.small_rotation, true);
  assert.equal(g.pages, 1);
  assert.match(r.warnings.join(" "), /No schedule for: ghost/);
  // Unknown size is totals only.
  const anon = oncallHealth(pages, shifts.map((s) => ({ ...s, member: "" })), { from: "2026-09-07", to: "2026-09-13" }) as any;
  assert.equal(anon.rotations.find((x: any) => x.rotation === "p").small_rotation, true);
  // Absurd shifts are skipped quickly.
  const t0 = Date.now();
  const long = oncallHealth(pages, [{ rotation: "p", start: "2026-01-01T00:00:00Z", end: "9999-01-01T00:00:00Z", member: "a" }], {}) as any;
  assert.ok(Date.now() - t0 < 500);
  assert.match(long.warnings.join(" "), /skipped/);
  // Named time zone with daylight saving: 08:30 UTC on 2026-07-01 is 09:30 in London (working hours).
  const tz = oncallHealth([{ rotation: "p", created_at: "2026-07-01T08:30:00Z", alert: "y", actionable: "true" }], shifts.map((s) => ({ ...s, start: "2026-06-29T00:00:00Z", end: "2026-07-06T00:00:00Z" })), { from: "2026-06-29", to: "2026-07-05", timeZone: "Europe/London" }) as any;
  assert.equal(tz.rotations[0].off_hours_share_pct, 0);
});

test("action age: open, overdue, bands, close time, no owners", () => {
  const rows = [
    { id: "a1", incident: "INC-1", title: "Add retry alert", owner_role: "on-call engineer", owner: "Engineer X1", created_at: "2026-07-15", due: "2026-08-15", completed_at: "" },
    { id: "a2", incident: "INC-1", title: "Runbook", owner_role: "tech lead", created_at: "2026-07-15", due: "2026-07-30", completed_at: "2026-07-25" },
    { id: "a3", incident: "INC-2", title: "Load test", owner_role: "team", created_at: "2026-10-01", due: "", completed_at: "2026-10-30" },
    { id: "a4", incident: "INC-2", title: "No date", created_at: "" },
  ];
  const r = actionAge(rows, { now: "2026-10-19" });
  assert.equal(r.open_actions, 2);
  assert.equal(r.closed_actions, 1);
  assert.equal(r.undated_rows, 1);
  assert.equal(r.median_days_to_close, 10);
  assert.equal(r.overdue_actions, 1);
  assert.equal(r.no_due_date, 1);
  assert.deepEqual(r.open_by_age, { "0-30 days": 1, "31-60 days": 0, "61-90 days": 0, "over 90 days": 1 });
  assert.equal(r.open[0].id, "a1");
  assert.equal(r.open[0].age_days, 96);
  assert.equal(r.by_incident["INC-1"].oldest_open_age_days, 96);
  assert.ok(!JSON.stringify(r).includes("Engineer X1"));
  const odd = debtAllocation({
    debtIssues: [
      { id: "U", created_at: "2026-09-01", completed_at: "2026-09-10", cycle: "C1", estimate: "Unestimated" },
      { id: "F", created_at: "2026-10-25", completed_at: "", estimate: 5 },
      { id: "O", created_at: "2026-09-01", completed_at: "", estimate: "n/a" },
    ],
    sprintTotals: [{ sprint: "C1", completed_points: 20 }],
    now: "2026-10-19",
  });
  assert.deepEqual(odd.register.map((x) => x.id), ["O"]);
  assert.equal(odd.open_debt_points, 0);
  assert.equal(odd.allocation[0].debt_share_pct, 0);
  assert.equal(odd.allocation[0].debt_items_without_points, 1);
});

test("action age compares calendar days, not times of day", () => {
  const rows = [
    { id: "today", incident: "I", created_at: "2026-10-01T23:30:00Z", due: "2026-10-19" },
    { id: "late", incident: "I", created_at: "2026-07-21T22:00:00Z", due: "2026-10-18T09:00:00Z" },
  ];
  const r = actionAge(rows, { now: "2026-10-19T12:00:00Z" });
  const byId = Object.fromEntries(r.open.map((a) => [a.id, a]));
  assert.equal(byId.today.overdue_days, null);
  assert.equal(byId.today.age_days, 18);
  assert.equal(byId.late.age_days, 90);
  assert.equal(byId.late.overdue_days, 1);
  assert.equal(r.open_by_age["61-90 days"], 1);
});

test("hiring funnel: pass-through rates and count warnings", () => {
  const r = hiringFunnel([{ stage: "applied", count: 120 }, { stage: "screen", count: 30 }, { stage: "onsite", count: 8 }, { stage: "offer", count: 10 }]);
  assert.equal(r.stages[1].pass_through_pct, 25);
  assert.equal(r.stages[2].of_first_stage_pct, 6.7);
  assert.equal(r.stages[0].pass_through_pct, null);
  assert.equal(r.warnings.length, 1);
  const bad = hiringFunnel([{ stage: "applied", count: 100 }, { stage: "screen", count: 30.5 }, { stage: "onsite", count: -2 }, { stage: "offer", count: 1 }]);
  assert.deepEqual(bad.stages.map((s) => s.pass_through_pct), [null, null, null, null]);
  assert.deepEqual(bad.stages.map((s) => s.of_first_stage_pct), [100, null, null, 1]);
  assert.equal(bad.warnings.length, 2);
});

test("capacity: one unit, PTO as person-days, buffer and points from history", () => {
  // 2026-11-02 (Mon) to 2026-11-13 (Fri): 10 working days, one holiday on 11-11.
  const r = capacity({
    members: 5, from: "2026-11-02", to: "2026-11-13", holidays: ["2026-11-11"],
    pto: [
      { person: "x1", start: "2026-11-02", end: "2026-11-04" },
      { person: "x1", start: "2026-11-04", end: "2026-11-04" },
      { person: "x2", start: "2026-11-11", end: "2026-11-11" },
      { person: "x3", start: "2026-11-07", end: "2026-11-08" },
    ],
    meetingHoursPerPersonPerWeek: 5, oncallHours: 80, oncallLoadFactor: 0.5,
    sprints: [
      { sprint: "S1", start: "2026-09-21", end: "2026-10-02", completed_points: 40, unplanned_points: 8 },
      { sprint: "S2", start: "2026-10-05", end: "2026-10-16", completed_points: 30, unplanned_points: 6 },
      { sprint: "S3", start: "2026-10-19", end: "2026-10-30", completed_points: 50, unplanned_points: 10 },
    ],
    plannedHours: 1000,
  });
  assert.equal(r.steps.raw_hours, 400);
  assert.equal(r.steps.minus_holidays_hours, 40);
  assert.equal(r.pto_person_days, 3);
  assert.equal(r.steps.available_hours, (5 * 9 - 3) * 8);
  assert.equal(r.steps.minus_meeting_hours, 50);
  assert.equal(r.steps.minus_oncall_hours, 40);
  assert.equal(r.steps.unplanned_buffer_pct, 20);
  assert.equal(r.steps.capacity_hours, Math.round((336 - 50 - 40) * 0.7 * 0.8));
  assert.equal(r.points!.median, Math.round(40 * (336 / 400) * 0.8));
  assert.ok(r.warnings.some((w) => /more than capacity/.test(w)));
  assert.ok(!JSON.stringify(r).includes("x1"));
});

test("capacity ignores unfinished sprints and missing measurements, and rejects bad dates", () => {
  const base = { members: 4, from: "2026-11-02", to: "2026-11-13" };
  const done = (n: number, start: string, end: string) => ({ sprint: `S${n}`, start, end, completed_points: 20, unplanned_points: 4 });
  const r = capacity({
    ...base,
    sprints: [
      done(1, "2026-09-21", "2026-10-02"), done(2, "2026-10-05", "2026-10-16"), done(3, "2026-10-19", "2026-10-30"),
      { sprint: "S4", start: "2026-11-02", end: "2026-11-13", completed_points: 3, unplanned_points: 0 },
      { sprint: "S5", start: "2026-11-16", end: "2026-11-27", completed_points: 0, unplanned_points: 0 },
    ],
  });
  assert.equal(r.past_sprints_used, 3);
  assert.equal(r.steps.unplanned_buffer_pct, 20);
  assert.ok(r.warnings.some((w) => /not finished/.test(w)));
  const m = capacity({ ...base, sprints: [done(1, "2026-09-21", "2026-10-02"), { sprint: "S2", start: "2026-10-05", end: "2026-10-16", completed_points: 20 }] });
  assert.equal(m.past_sprints_used, 1);
  assert.ok(m.warnings.some((w) => /missing/.test(w)));
  const none = capacity({ ...base, sprints: [{ sprint: "S2", start: "2026-10-05", end: "2026-10-16", completed_points: 20 }] });
  assert.equal(none.steps.unplanned_buffer_pct, null);
  assert.throws(() => capacity({ ...base, from: "2026-11-31" }), /real YYYY-MM-DD/);
  assert.throws(() => capacity({ ...base, from: "2026-11-20" }), /starts after it ends/);
});

test("capacity without history warns and keeps no buffer", () => {
  const r = capacity({ members: 4, from: "2026-11-02", to: "2026-11-06" });
  assert.equal(r.steps.capacity_hours, Math.round(4 * 5 * 8 * 0.7));
  assert.equal(r.points, null);
  assert.ok(r.warnings.some((w) => /No sprint history/.test(w)));
  // A week-long shift from Friday 09:00 to Friday 09:00 covers Mon to Thu working hours: 4 x 8.
  const s = capacity({ members: 4, from: "2026-11-02", to: "2026-11-06", oncallShifts: [{ start: "2026-10-30T09:00:00Z", end: "2026-11-06T09:00:00Z" }] });
  assert.equal(s.steps.oncall_hours_in_period, 32);
  assert.equal(s.steps.minus_oncall_hours, Math.round(32 * 0.3));
  assert.equal(s.past_sprints.length, 0);
});

test("hotspots: files from a no-author git log, scored by commits x lines", () => {
  const log = ["--2026-10-01", "10\t2\tsrc/payouts/worker.ts", "1\t1\tREADME.md", "", "--2026-10-05", "30\t5\tsrc/payouts/worker.ts", "-\t-\tassets/logo.png", "", "--2026-10-09", "4\t0\tsrc/refunds/handler.ts"].join("\n");
  const r = hotspots({
    logText: log,
    sizes: [{ path: "src/payouts/worker.ts", lines: 900 }, { path: "src/refunds/handler.ts", lines: 400 }, { path: "README.md", lines: 50 }],
    todos: [{ path: "src/payouts/worker.ts", count: 3 }],
    incidentPaths: [{ incident: "INC-7", path: "src/payouts/worker.ts" }],
  });
  assert.equal(r.commits_read, 3);
  assert.equal(r.hotspots[0].path, "src/payouts/worker.ts");
  assert.equal(r.hotspots[0].commits, 2);
  assert.equal(r.hotspots[0].churn_lines, 47);
  assert.equal(r.hotspots[0].score, 1800);
  assert.deepEqual(r.hotspots[0].incidents, ["INC-7"]);
  assert.equal(r.hotspots[0].todo_fixme, 3);
  assert.equal(r.hotspots.find((h) => h.path === "assets/logo.png")!.churn_lines, 0);
  const noSize = hotspots({ logText: log, from: "2026-10-05" });
  assert.equal(noSize.score_basis, "commits x churn (no file sizes given)");
  assert.equal(noSize.commits_read, 2);
  const newestFirst = ["--2026-10-09", "4\t0\ta.ts", "--2026-10-01", "1\t1\ta.ts"].join("\n");
  assert.deepEqual(hotspots({ logText: newestFirst }).window, { from: "2026-10-01", to: "2026-10-09" });
});

test("debt allocation: register oldest first, share per sprint, unknown points kept apart", () => {
  const debt = [
    { id: "D1", title: "Old", created_at: "2026-06-01", completed_at: "", estimate: 3, assignee: "Engineer X1" },
    { id: "D2", title: "Newer", created_at: "2026-09-01", completed_at: "", estimate: "" },
    { id: "D3", title: "Done", created_at: "2026-08-01", completed_at: "2026-09-10", cycle: "C1", estimate: 5 },
    { id: "D4", title: "Done no points", created_at: "2026-08-01", completed_at: "2026-09-11", cycle: "C1", estimate: "" },
  ];
  const r = debtAllocation({ debtIssues: debt, sprintTotals: [{ sprint: "C1", completed_points: 25 }, { sprint: "C2", completed_points: 0 }], targetPct: 15, now: "2026-10-19" });
  assert.deepEqual(r.register.map((x) => x.id), ["D1", "D2"]);
  assert.equal(r.register[0].age_days, 140);
  assert.equal(r.register[1].points, null);
  assert.equal(r.allocation[0].debt_share_pct, 20);
  assert.equal(r.allocation[0].vs_target_pct, 5);
  assert.equal(r.allocation[0].debt_items_without_points, 1);
  assert.equal(r.allocation[1].debt_share_pct, null);
  assert.ok(!JSON.stringify(r).includes("Engineer X1"));
});
