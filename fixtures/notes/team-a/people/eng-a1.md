---
name: Engineer A1
slug: eng-a1
role: Senior Engineer
level: E4
team: Team A
sub_team: Ledger
start_date: 2023-02-06
email: eng-a1@team-a.example
github: eng-a1
one_on_one_cadence: biweekly
next_one_on_one: 2026-10-20
career_goals:
  - Reach Staff (E5) within 12 months
  - Lead a cross-team design end to end
feedback_preferences: Direct feedback in writing first, then talk it through
---

# Engineer A1

## Log

### 2026-10-06 1:1
- **Refund API slip:** Refund API v2 for mobile is late by about two weeks due to the partial refund edge case. Raised it with Team B early.
- **Next:** I will update the exec update and the launch date.

### 2026-09-22 1:1
- **Workload:** Workload feels about right this fortnight.

### 2026-09-08 1:1
- **Promotion:** Talked about the E5 case. Strongest evidence: refunds v2 design, mentoring, incident leadership in July. Gap: little evidence of setting direction beyond the team.
- **Next:** I will ask for a slot at the platform guild so A1 can propose the idempotency standard.

### 2026-08-25 1:1
- **New joiner:** Agreed to be A4's onboarding buddy. Wrote an onboarding guide to the ledger.
- **Next:** Check in with A4 after week 2.

### 2026-07-14 1:1
- **Career:** Revisited career goals. Wants more design work.
- **Next:** I will look for a design doc they can own.

### 2026-06-30 1:1
- **Mentoring:** Started pairing with A7 on the ledger model twice a week. Asked how to give feedback on design without taking over.
- **Next:** Suggested Lara Hogan's feedback equation.

### 2026-06-16 1:1
- **Code review load:** Mentioned review queue feels long on Thursdays.
- **Next:** Agreed to try a review slot after standup.

### 2026-06-02 1:1
- **RFC review:** RFC approved after review with Team B and Finance. Handled pushback on the 90-day deprecation calmly and changed the plan to keep the old endpoint.
- **Next:** Share the RFC at the architecture forum.

### 2026-05-05 1:1
- **Refunds v2 design:** Volunteered to write the refunds v2 RFC. Clear on the scope and the mobile dependency.
- **Next:** I will add Manager B's team as reviewers.

### 2026-04-21 1:1
- **Holiday:** Planning two weeks off in August.
- **Next:** Cover plan agreed.

## Open threads

- E5 case: needs evidence of direction-setting beyond the team
- Refund API v2 new date 2026-10-23

## Actions

- [ ] EM: get A1 a platform guild slot for the idempotency standard (due 2026-10-31)
- [x] A1: share refunds RFC at architecture forum (due 2026-06-20)

## Evidence

```yaml evidence
id: ev-a1-rfc
person: eng-a1
source: manual
date: 2026-06-02
link: https://docs.example.com/rfc/refunds-v2
situation: "Refunds v2 needed a design that both the API and mobile teams could build against."
behaviour: "Wrote the refunds v2 RFC, ran reviews with Team B and Finance, and changed the deprecation plan after feedback."
impact: "Two teams aligned on one design; Finance signed off in one review round."
competency: technical-design
captured: 2026-06-02
```

```yaml evidence
id: ev-a1-incident
person: eng-a1
source: note
date: 2026-07-14
link: null
situation: "Payout batch stuck for 40 minutes during a SEV2."
behaviour: "Took incident lead, kept the channel updated every 10 minutes and wrote the timeline."
impact: "Recovered in 52 minutes; postmortem actions owned and closed in two weeks."
competency: ownership
captured: 2026-07-14
```

```yaml evidence
id: ev-a1-mentoring
person: eng-a1
source: note
date: 2026-09-01
link: null
situation: "A7 wanted to grow in ledger design."
behaviour: "Paired twice a week for 8 weeks and reviewed her design doc with written comments."
impact: "A7 led the ledger export design review herself in September."
competency: mentoring
captured: 2026-09-01
```

```yaml evidence
id: ev-a1-onboarding
person: eng-a1
source: note
date: 2026-09-12
link: null
situation: "A4 joined with no payments background."
behaviour: "Wrote a ledger onboarding guide and paired on her first three PRs."
impact: "A4 merged her first PR in week 2."
competency: mentoring
captured: 2026-09-12
```

```yaml evidence
id: ev-a1-slip
person: eng-a1
source: slack
date: 2026-10-09
link: https://slack.example.com/archives/C0TEAMA3/p1791562800000
situation: "Refund API v2 hit a partial refund edge case late."
behaviour: "Flagged the slip in public with a new date and the reason."
impact: "Team B re-planned the refunds screen a week ahead rather than at the deadline."
competency: collaboration
captured: 2026-10-09
```
