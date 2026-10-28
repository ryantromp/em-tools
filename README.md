# em-tools

em-tools is a free, open plugin for software engineering managers. It reads your notes and tool data, cites where each fact came from, and drafts the work around your team: 1:1 prep, review and promotion evidence, weekly updates, delivery and on-call health, feedback, postmortems, hiring loops, capacity, onboarding, tech debt, calibration, delegation, team pulse, RFC reviews and headcount cases. You make every judgement yourself.

How it behaves:

- Your people notes are markdown files in a folder you choose, and nothing is uploaded.
- Integrations only read, and em-tools never sends, posts or comments. You copy the drafts. While an em-tools skill is in use, a hook blocks connector tools that write and shell commands that send data out (such as `curl`, `gh pr comment` or `git push`). The hook catches mistakes; it is not a sandbox. [CONNECTORS.md](CONNECTORS.md#how-writes-are-blocked) has deny rules for a hard block.
- Ratings, verdicts and promotion decisions are left blank for you to fill in.
- Engineers are never ranked or compared. Team metrics stay at team level, and AI adoption figures appear only for groups of 4 or more.
- You don't need to connect anything. Every skill works from pasted notes or CSV exports, and connectors just add data.

More detail: [the spec](docs/spec.md), [the research behind it](docs/research.md) and [connector setup](CONNECTORS.md).

## Skills

Run a skill with its command, or ask in plain words as in the example prompts. The examples use the code names from the test fixtures.

| Skill | Command | Example prompt | What you get |
|---|---|---|---|
| `ai-adoption` | `/em-tools:ai-adoption all` | "How is the team using AI coding tools this quarter, and is the spend paying off?" | Team-wide adoption with an enablement plan, spend set against delivery and quality, AI code quality risks, and a governance kit you can adapt to your region |
| `calibration-prep` | `/em-tools:calibration-prep team` | "Prep my calibration pages and check my draft ratings against the evidence" | One page per report with your claim, the 3 strongest dated evidence items, the ladder mapping and gaps, plus a check of your own draft rating and wording. It never ranks people, compares them or suggests a rating |
| `capacity-plan` | `/em-tools:capacity-plan next sprint` | "How much can we take on next sprint? Here's the PTO list and the on-call schedule" | Team capacity in hours with each deduction shown, a buffer taken from your own sprint history, a points range scaled from past sprints, and a warning if the plan is too big. PTO appears only as team person-days |
| `delegation-board` | `/em-tools:delegation-board` | "What could I hand off this month, and who on the team wants that kind of work?" | Your "only I can do this" list (5 items at most) and tasks you could delegate, matched to each report's stated career goals, with a check-in date and a draft ask. It never matches on workload, output or availability |
| `dependency-register` | `/em-tools:dependency-register` | "What are we blocked on from other teams, and who is waiting on us?" | What the team is waiting on from other teams and what they are waiting on from you, aged in working days, with nudge drafts for stale items and the share of cycle time spent blocked |
| `feedback-rehearsal` | `/em-tools:feedback-rehearsal <name>` | "Help me give Engineer A2 feedback about their code review comments" | Your observation split into what happened, its impact and your request, a check for vague or loaded words, the core needs it may touch, and 3 likely responses with a calm reply to each. Saved only if you ask |
| `headcount-case` | `/em-tools:headcount-case` | "Do we have a case for another engineer next quarter? Here's the roadmap" | A one-page case built from your capacity plan, debt register, on-call health and roadmap. It sets demand against capacity and on-call load against SRE guidance, shows the unplanned work and debt gap, and lists options (including doing nothing) costed with your figures. It also says which evidence does not point to hiring. Team-level evidence only |
| `hiring-loop-kit` | `/em-tools:hiring-loop-kit <role> plan` | "Plan the interview loop for our senior payments engineer role" | A loop where each competency is assessed in one interview, a fixed question bank, scorecard templates, suggested interviewers, a debrief agenda where feedback is written before discussion, and a funnel tally. It never scores, ranks or recommends a candidate |
| `onboarding-plan` | `/em-tools:onboarding-plan <name> plan` | "Engineer B7 starts Monday. Draft their 30/60/90 plan" | A 30/60/90 plan from your team template and the first 1:1, with a buddy checklist and dated check-ins, then prep for the day-30, 60 and 90 check-ins. Milestones are agreed outcomes, never activity counts |
| `oncall-health` | `/em-tools:oncall-health 12 weeks` | "How healthy is our on-call rotation, and which alerts should we fix first?" | On-call load per rotation against Google SRE guidance, the busiest 12-hour windows, and the noisy or unactionable alerts to fix first. Figures are per rotation, never per person or per shift |
| `one-on-one` | `/em-tools:one-on-one <name> prep` | "Prep my 1:1 with Engineer A3 tomorrow" | A prep sheet with recent work, open threads, actions due, recurring themes, career goals, the next 1:1 date and any missed or overdue sessions. After the meeting it logs your notes once you confirm them |
| `postmortem-draft` | `/em-tools:postmortem-draft <incident>` | "Draft the postmortem for last Tuesday's payout incident from the incident channel" | A blameless draft with summary, impact, timeline, contributing factors and actions to copy into your tracker, using roles instead of names, plus the age of open postmortem actions across incidents |
| `review-packet` | `/em-tools:review-packet <name> promo <level>` | "Pull together promotion evidence for Engineer A1 against the senior level" | Evidence for each ladder competency, written as situation, behaviour and impact, a map of which competencies and months have evidence, a check for vague or biased wording, and blank rating and verdict fields for you |
| `rfc-review` | `/em-tools:rfc-review <rfc>` | "Review this RFC before I send it round, and tell me who should review it" | A check against your RFC template, open questions and unstated assumptions, reviewers from CODEOWNERS, a review-by date and draft comments. After launch it can compare the RFC with what shipped. It reviews the document, never the author |
| `team-delivery-health` | `/em-tools:team-delivery-health 12 weeks` | "How has delivery gone over the last 12 weeks? I want talking points for the retro" | DORA and PR flow measures at team level, plus meeting load, written up as a narrative with likely causes and questions for your retro. There is no red/green dashboard |
| `team-pulse` | `/em-tools:team-pulse <export>` | "What is the team pulse saying this month? Here's the survey export" | Themes over time across the six Maslach areas from an anonymous check-in you run in your own survey tool, with retro prompts. It hides any group with fewer than 4 answers and never quotes comments |
| `tech-debt-register` | `/em-tools:tech-debt-register` | "Where is tech debt costing us most? I'd like a case for more debt time" | A debt register built from tickets, TODOs and code hotspots (git history with no author data), with linked incidents and the business impact in plain words, debt time against your target, and a one-page case for leadership |
| `underperformance-record` | `/em-tools:underperformance-record <name> review` | "Update the record for Engineer A3 after today's check-in" | A dated, append-only record of the expectations you set, the support you offered and the change you have seen, in your own words, with a checklist and any gaps. No scores, predictions or PIP advice. You choose whether it lives in a separate file or the person file |
| `upward-update` | `/em-tools:upward-update` | "Draft my weekly update for my director" | An exec version and an engineering version covering what's done, what slipped and why, risks, asks, items that have gone quiet, and decisions from the public channels you name |

To see real output, run `node scripts/run-examples.mjs`. It runs every skill against synthetic fixtures with nothing connected and writes the results to `examples/` on your machine. Those outputs are never committed, and because the fixtures use code names such as Engineer A3, none of them can match a real person.

## Install

### Claude Code (and the Claude desktop app)

You need Node.js 20 or later.

1. Clone the repo: `git clone https://github.com/ryantromp/em-tools.git`
2. Add it as a local marketplace: `claude plugin marketplace add ./em-tools`
3. Install: `claude plugin install em-tools@em-tools`
4. Answer the three install questions:
   - Locale (required): a tag such as `en-GB` or `en-US`, which sets spelling, date format and voice.
   - Notes folder (required): any folder you back up, for example `~/Documents/em-notes`. Don't use the plugin's own data folder, because it is deleted on uninstall. em-tools itself never deletes notes.
   - Enabled integrations: any of `github`, `jira`, `linear`, `google_calendar`, `outlook`, `slack`, `teams`, `pagerduty`, `incident_io`. Leave it empty to start with paste-in only.
5. Sign in to each enabled source with `/mcp`. See [CONNECTORS.md](CONNECTORS.md).

To try it for one session without installing: `claude --plugin-dir ./em-tools`.

### Other agents that read SKILL.md

The `skills/` folders use the open SKILL.md format, so you can copy them into your agent's skills folder. If your agent supports MCP, also run the notes and metrics server: `node server/dist/em-tools-server.mjs`, with `EM_TOOLS_NOTES_FOLDER` and `EM_TOOLS_LOCALE` set. The read-only hook is Claude Code only. Elsewhere, connect each source in its own read-only mode (see [CONNECTORS.md](CONNECTORS.md)).

### Without the em-tools server

Some setups don't run the bundled server: claude.ai chat, Cowork sessions that don't run on your computer, and workspaces whose policy turns off plugin MCP servers. The skills then fall back in two steps:

1. File mode: if Claude can read your notes folder, the skills read the markdown files directly and save nothing.
2. Paste-in mode: otherwise, paste your notes and exports and you get the same outputs. Nothing is stored, so save anything you want to keep.

The read-only hook also runs only where plugin hooks run (Claude Code and Cowork). Check `/mcp` for the `em-tools` server before relying on saved notes.

## Your notes

```
<notes folder>/
  team.md                 members, sub-teams, cadence, repos, channels, ladder path
  ladder.md               optional career ladder; a generic one is used if absent
  onboarding.md           optional team onboarding template; a generic one is used if absent
  people/<slug>.md        one file per person: frontmatter, Log, Open threads, Actions, Evidence
  people/<slug>.expectations.md   underperformance record, if you chose a separate file
  hiring/<role>/          loop documents and append-only candidate scorecards (codes, not names)
  drafts/                 outputs you chose to save
```

Each person file is plain markdown with YAML frontmatter, so you can read and edit it in any editor. em-tools saves a `.bak` copy before every change. [fixtures/notes/team-a](fixtures/notes/team-a) has a complete example.

## Privacy

The full policy is in [PRIVACY.md](PRIVACY.md).

- Your notes files stay on your disk. The em-tools server reads and writes only inside your notes folder and makes no network calls. What a skill reads becomes part of your Claude conversation, which Anthropic processes under your Claude plan's terms.
- Integrations go through each vendor's own MCP server, signed in as you, and em-tools calls only their read tools.
- AI usage data is summed in memory, and per-person rows are never shown or saved.
- No telemetry, analytics or cloud storage.

## Not legal or HR advice

Review packets, promotion cases, calibration pages, the AI governance kit and anything that mentions underperformance, wellbeing or burnout end with "check with your HR or legal team". Headcount cases end with a reminder to check your budget process and HR. em-tools gathers the evidence, and you and your organisation decide.

## Develop

| Task | Command |
|---|---|
| Guard tests | `node --test tests/*.test.mjs` |
| Server tests | `cd server && npm install && npm test` |
| Rebuild the prebuilt server | `cd server && npm run build` |
| Regenerate fixtures | `node scripts/generate-fixtures.mjs` |
| Make example outputs locally (needs a signed-in `claude` CLI; git-ignored) | `node scripts/run-examples.mjs` |
| Lint (em-dashes, send or post calls, per-person ranking) | `scripts/lint` |
| Validate the plugin | `claude plugin validate . --strict` |
| Live test with your own accounts | [tests/live-test-steps.md](tests/live-test-steps.md) |

## Licence

MIT. See [LICENSE](LICENSE).
