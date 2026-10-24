# Evidence item schema

One item records one specific, observable piece of work in situation, behaviour and impact form. The same schema feeds `one-on-one` and `review-packet`.

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Stable and unique, such as `ev-2026-09-14-pr-412` |
| `person` | yes | Person slug |
| `source` | yes | `note`, `github`, `linear`, `jira`, `slack`, `teams`, `calendar` or `manual` |
| `date` | yes | Date of the behaviour (YYYY-MM-DD), not the date it was recorded |
| `link` | yes, unless source is `note` or `manual` | URL to the PR, ticket, message or doc |
| `situation` | yes | Context, facts only |
| `behaviour` | yes | What the person did, observable, no adjectives about character |
| `impact` | yes | The effect on the team, users or business, as the EM saw it |
| `competency` | no | Ladder competency key, set by the EM |
| `captured` | yes | Date recorded (YYYY-MM-DD) |

Stored in the person's file under `## Evidence`:

````
```yaml evidence
id: ev-2026-09-14-pr-412
person: eng-x1
source: github
date: 2026-09-14
link: https://github.com/org/repo/pull/412
situation: "Release blocked by a failing migration."
behaviour: "Wrote the fix and a regression test, and paired with QA to verify."
impact: "Release shipped the same day."
competency: execution
captured: 2026-09-15
```
````

Good behaviour text is observable: "Split the change into four PRs under 250 lines." Weak text is a judgement: "Was very proactive."
