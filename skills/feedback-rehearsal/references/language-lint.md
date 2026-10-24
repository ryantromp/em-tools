# Language check

Flag these in packets and review drafts. The research behind the categories: women receive vaguer feedback and more personality criticism than men (Correll et al. 2021; Textio 2022 and 2024), and vague feedback makes it harder to argue for advancement (Correll and Simard 2016). See docs/research.md in the em-tools repo.

| Category | Examples to flag | Why | Better |
|---|---|---|---|
| Vague | "great job", "solid", "good work", "needs to step up", "lacks polish", "not strategic enough" | Not actionable, cannot be checked | Name the situation, the behaviour and the impact |
| Personality | "abrasive", "aggressive", "bossy", "emotional", "opinionated", "difficult", "nice", "pleasant", "humble", "a joy", "drama" | Judges character, not work; applied unequally | Describe the observable behaviour and its effect |
| Gendered or coded | "bubbly", "shrill", "feisty", "nurturing", "rock star", "ninja", "brogrammer", "culture fit", "polished", "articulate" | Coded by gender, race or age | Use the ladder's words |
| Hedged | "seems to", "might be", "a bit", "somewhat", "kind of" | Hides the point | State what happened, with a date |
| Absolute | "always", "never", "everyone", "no one" | Rarely true; invites dispute | Count instances, with dates |
| Potential, not evidence | "has potential", "natural leader", "not ready", "not a leader" | Predicts rather than evidences; a known bias channel | Cite evidence against the level criteria |
| Output as merit | lines of code, commit counts, PR counts as the headline | Measures activity, not impact | Lead with impact; counts only as context |

Also check:

- **Consistency:** does the tone of the text match the strength of the evidence? Flag praise with no cited item and criticism with no cited item.
- **Recency:** more than half of cited items from the last 6 weeks of the period.
- **Attribution:** "we" or "the team" used for the person's own work, or the person credited for team work.

The check is a prompt for the EM, not a verdict. Some words are fine in context; the EM decides.
