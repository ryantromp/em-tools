# em-tools

Free, open, local-first help for software engineering managers. em-tools prepares your 1:1s, assembles evidence for reviews and promotion cases, drafts your weekly update, writes a team delivery health narrative, reports on team AI adoption, keeps a cross-team dependency register, checks on-call health, and helps you shape and rehearse feedback. It reads your data, cites its sources, and leaves every judgement to you.

- **Local-first.** Your people notes are markdown files in a folder you pick. Nothing is uploaded, and there is no telemetry, analytics or cloud storage.
- **Read-only.** Integrations only read. A hook blocks write tools, and em-tools never sends, posts or comments. You copy the drafts.
- **Evidence, not verdicts.** Ratings, verdicts and promotion decisions stay blank for you to write.
- **No ranking.** Engineers are never ranked or compared. Team metrics are team-level, and AI adoption figures show only for groups of 4 or more.
- **Works with nothing connected.** Every skill runs from pasted notes or CSV exports. Connectors add data, and none are required.

Spec: [docs/spec.md](docs/spec.md). Research: [docs/research.md](docs/research.md). Connectors: [CONNECTORS.md](CONNECTORS.md).

## Skills

| Skill | Try | What you get |
|---|---|---|
| `one-on-one` | `/em-tools:one-on-one <name> prep` | Prep sheet: recent work, open threads, actions due, recurring themes, career goals, next 1:1 and missed or overdue flags. Also logs your notes after you confirm them |
| `review-packet` | `/em-tools:review-packet <name> promo <level>` | Evidence by ladder competency in situation, behaviour and impact form, a coverage map, a language check for vague or biased wording, and blank rating and verdict fields |
| `upward-update` | `/em-tools:upward-update` | Exec and engineering versions covering done, slipped and why, risks, asks, items gone quiet, and decisions from the public channels you name |
| `team-delivery-health` | `/em-tools:team-delivery-health 12 weeks` | DORA and PR flow at team level, plus meeting load, in a written narrative with likely causes and questions for your retro. No red/green dashboard |
| `ai-adoption` | `/em-tools:ai-adoption all` | Team adoption with an enablement plan, spend against delivery and quality, AI code quality risk, and a region-neutral governance kit |
| `dependency-register` | `/em-tools:dependency-register` | What the team waits on from other teams and what they wait on from you, aged in working days, with nudge drafts for stale items and the blocked share of cycle time |
| `oncall-health` | `/em-tools:oncall-health 12 weeks` | On-call load per rotation against Google SRE guidance, busy 12-hour windows, and the noisy or unactionable alerts to fix first. Never per person, never shift dates |
| `feedback-rehearsal` | `/em-tools:feedback-rehearsal <name>` | Your observation as observation, impact and request, a language check, the core needs it may touch, and 3 likely responses with a calm reply to each. Saved only if you ask |

To see what each skill produces, run `node scripts/run-examples.mjs`. It runs every skill against the synthetic fixtures with nothing connected and writes the outputs to `examples/` on your machine. Example outputs are never committed. The fixtures use code names such as Engineer A3, so no output can match a real person.

## Install

### Claude Code (and the Claude desktop app)

You need Node.js 20 or later.

1. Clone the repo: `git clone https://github.com/ryantromp/em-tools.git`
2. Add it as a local marketplace: `claude plugin marketplace add ./em-tools`
3. Install: `claude plugin install em-tools@em-tools`
4. Answer the three install questions:
   - **Locale** (required): a tag such as `en-GB` or `en-US`. It sets spelling, date format and voice.
   - **Notes folder** (required): any folder you back up, for example `~/Documents/em-notes`. Do not use the plugin's own data folder, which is deleted on uninstall. em-tools never deletes notes.
   - **Enabled integrations**: any of `github`, `jira`, `linear`, `google_calendar`, `outlook`, `slack`, `teams`, `pagerduty`, `incident_io`. Leave it empty to start with paste-in only.
5. Sign in to each enabled source with `/mcp`. See [CONNECTORS.md](CONNECTORS.md).

To try it for one session without installing: `claude --plugin-dir ./em-tools`.

### Other agents that read SKILL.md

The `skills/` folders follow the open SKILL.md format, so copy them to your agent's skills folder. If your agent speaks MCP, also run the notes and metrics server: `node server/dist/em-tools-server.mjs`, with `EM_TOOLS_NOTES_FOLDER` and `EM_TOOLS_LOCALE` set. The read-only hook is Claude Code only. Elsewhere, connect each source in its own read-only mode (see [CONNECTORS.md](CONNECTORS.md)).

### Claude on the web, or anywhere without local disk or MCP

The skills still work in **paste-in mode**: paste your notes and exports, and get the same outputs. **Nothing is stored** in this mode, so save anything you want to keep yourself.

## Your notes

```
<notes folder>/
  team.md                 members, sub-teams, cadence, repos, channels, ladder path
  ladder.md               optional career ladder; a generic one is used if absent
  people/<slug>.md        one file per person: frontmatter, Log, Open threads, Actions, Evidence
  drafts/                 outputs you chose to save
```

Each person file is plain markdown with YAML frontmatter, so you can read and edit it in any editor. Before every change, em-tools writes a `.bak` of the previous version. See [fixtures/notes/team-a](fixtures/notes/team-a) for a full example.

## Privacy

- People notes stay on your disk. The em-tools server reads and writes only inside your notes folder and makes no network calls.
- Integrations run through each vendor's own MCP server under your own sign-in, and em-tools only calls their read tools.
- AI usage data is aggregated in memory. Per-person rows are never shown or saved.
- No telemetry, analytics or cloud storage.

## Not legal or HR advice

Review packets, promotion cases, anything that mentions underperformance, wellbeing or burnout, and the AI governance kit all end with "check with your HR or legal team". em-tools prepares evidence; you and your organisation make the decisions.

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
