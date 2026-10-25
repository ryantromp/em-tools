# <Team> tech debt register, <date>

Window: <from> to <to>. Debt label: `<label>`. Target: <n>% of completed points.

## Summary
<3 to 5 sentences>

## Hotspots (files that change often and are large)

| File | Commits | Lines | TODO/FIXME | Incidents | Why it matters |
|---|---|---|---|---|---|

## Register

| Item | Area | Age (days) | Business impact | Incidents | Next step | Link |
|---|---|---|---|---|---|---|

Items with no points: <list>.

## Allocation against target

| Sprint | Debt points | Completed points | Debt share | Against target |
|---|---|---|---|---|

<trend in words>

## Suggested next steps
1. <step>

## Method
- History from `git log --no-merges --numstat --format=--%cs` (no author field). Hotspot score = commits x lines.
- <sources and gaps>

---

# Leadership case: <title>

**Problem:** <business terms>
**Evidence:** <incidents, allocation gap, hotspots>
**Options:**
1. Do nothing: <risk>
2. <option>: <cost, effect>
3. <option>: <cost, effect>
**Ask:** <what and for how long>
