import { test } from "node:test";
import assert from "node:assert/strict";
import { actionAge, aiAdoption, dora, meetingLoad, prFlow, quantile, suppression } from "../src/metrics.ts";
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
