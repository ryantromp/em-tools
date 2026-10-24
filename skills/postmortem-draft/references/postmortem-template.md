# Postmortem: <incident title> (<incident id>), <date>

Status: draft for review. Blameless: roles, not names.

## Summary
<2 to 4 sentences>

## Impact
| Measure | Value | Source |
|---|---|---|
| Duration | <start> to <resolve> (<n> minutes) | <link> |
| Severity | <SEVn> | <link> |
| Affected | <as stated in sources> | <link> |

## Timeline (<time zone>)
| Time | Event | Source |
|---|---|---|
| <hh:mm> | <role> <what happened> | <link> |

## Contributing factors
1. **<system or condition>.** Evidence: <...>.

## What went well
- <credited to a role or the team>

## Actions (draft: copy into the tracker)
| Action | Type | Owner role | Suggested due | Addresses |
|---|---|---|---|---|

## Questions for the review
1. <question>

---

## Blame check before sharing

| Flag | Example | Rewrite as |
|---|---|---|
| A person's name | "Engineer X merged..." | "A config change was merged..." |
| Should have, failed to, careless, mistake by | "should have load tested" | "nothing in CI ran a full-size batch" |
| Human error as a root cause | "root cause: human error" | the condition that let the error through |
| Hindsight | "obviously", "clearly", "simply" | what was known at the time |
| Counterfactual blame | "if X had checked" | the missing check, as a system gap |
| Ownership by blame | "X picked the library, so X owns the fix" | an owner role chosen by the team |
