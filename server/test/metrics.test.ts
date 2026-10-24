import { test } from "node:test";
import assert from "node:assert/strict";
import { aiAdoption, dora, meetingLoad, prFlow, quantile, suppression } from "../src/metrics.ts";
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
