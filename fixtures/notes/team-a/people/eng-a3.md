---
name: Engineer A3
slug: eng-a3
role: Engineer
level: E3
team: Team A
sub_team: null
start_date: 2024-05-13
email: eng-a3@team-a.example
github: eng-a3
one_on_one_cadence: biweekly
next_one_on_one: 2026-10-20
career_goals:
  - Get faster at shipping well-scoped changes
  - Learn the ledger domain
feedback_preferences: Prefers to talk first, then get a written summary
---

# Engineer A3

## Log

### 2026-09-22 1:1
- **Progress:** PR sizes are down. Still slow to ask for help. Partial refund webhooks open since 22 Sep.
- **Next:** Daily 10-minute check-in for two weeks.

### 2026-09-08 1:1
- **Wellbeing:** Mentioned sleeping badly and a family situation. Did not want to go into detail.
- **Next:** Reminded about the employee assistance programme and flexible hours. Offered to lighten on-call.

### 2026-08-11 1:1
- **Expectations:** Set clear written expectations: PRs under 300 lines, ask for help after half a day stuck, update the ticket daily.
- **Next:** Sent the summary in writing after the 1:1.

### 2026-07-28 1:1
- **Delivery:** Two PRs reverted in July. Said they felt rushed to merge before the cycle ended.
- **Next:** Agreed smaller PRs and a checklist before merge. I will stop the end-of-cycle push.

### 2026-07-14 1:1
- **Workload:** Said the refund webhooks work is bigger than estimated. Seems stuck on the retry design.
- **Next:** Pair with A6 on the retry design this week.

### 2026-06-16 1:1
- **Feedback for me:** Asked for earlier notice on priority changes.
- **Next:** I will share roadmap changes in the team channel first.

### 2026-06-02 1:1
- **Workload:** Workload feels about right this fortnight.

### 2026-05-05 1:1
- **Team process:** Feedback that planning runs long.
- **Next:** I will timebox planning to 45 minutes.

### 2026-04-21 1:1
- **Career:** Revisited career goals. Wants more design work.
- **Next:** I will look for a design doc they can own.

## Open threads

- Partial refund webhooks stuck in review since 2026-09-22
- Wellbeing: check in gently, offered EAP on 2026-09-08

## Actions

- [ ] EM: reschedule the cancelled 2026-10-06 1:1 (due 2026-10-10)
- [x] EM: send written expectations summary (due 2026-08-19)
- [ ] A3: ask for help after half a day stuck (ongoing)

## Evidence

```yaml evidence
id: ev-a3-retry
person: eng-a3
source: github
date: 2026-06-16
link: https://github.com/example-co/payments-api/pull/1322
situation: "Webhook retries were failing silently."
behaviour: "Found the root cause and added alerting on retry exhaustion."
impact: "Silent failures dropped to zero over the next month."
competency: execution
captured: 2026-06-16
```

```yaml evidence
id: ev-a3-reverts
person: eng-a3
source: note
date: 2026-07-24
link: null
situation: "End of cycle with two webhook PRs pending."
behaviour: "Merged both PRs after one approval each, before tests on staging finished."
impact: "Both were reverted within a day; one caused a SEV3."
competency: execution
captured: 2026-07-24
```

```yaml evidence
id: ev-a3-smaller
person: eng-a3
source: github
date: 2026-09-24
link: https://github.com/example-co/payments-api/pull/1520
situation: "Partial refund webhooks needed a large change."
behaviour: "Split it into four PRs under 250 lines each."
impact: "Review time on those PRs halved compared with July."
competency: execution
captured: 2026-09-24
```
