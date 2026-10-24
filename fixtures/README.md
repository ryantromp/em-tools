# em-tools fixtures

Synthetic data for two invented teams at an invented company, ExampleCo. Nothing here describes real people or real systems. Regenerate with `node scripts/generate-fixtures.mjs` (deterministic).

Window: 2026-04-20 to 2026-10-16 (26 weeks). Calendar runs to 2026-10-30 so upcoming 1:1s exist. Examples treat 2026-10-19 as today.

| Team | EM | Engineers | Tracker | Calendar | Chat | AI tool | PRs | Deploys |
|---|---|---|---|---|---|---|---|---|
| Team A | Manager A | 7 | linear | google | slack | claude-code | 422 | 159 |
| Team B | Manager B | 6 | jira | outlook | teams | copilot | 389 | 39 |

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
| feedback/ | Two EM observations written in the EM's own words, with judgement and coded words left in on purpose, for feedback-rehearsal |
| notes/team-a/, notes/team-b/ | Each EM's notes folder: team.md, ladder.md (Team A only), one file per person, last week's update. Team A keeps Engineer A3's expectations record in a separate file; Team B has not chosen where records go |
