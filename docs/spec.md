# em-tools spec (v1)

Status: draft for review, 2026-10-23. Evidence and full source list: [research.md](research.md).

## TL;DR

- **What:** a free, open, local-first plugin that helps software EMs with the recurring work around their people and delivery. It ships as a Claude Code plugin, as portable SKILL.md skills, and as a thin MCP server.
- **Why:** paid tools are priced per seat. They either measure delivery (and drift toward per-person surveillance) or handle HR workflow. Nothing covers the EM seat: 1:1 continuity, evidence-based reviews, a written team narrative, upward updates and team AI adoption.
- **Core idea:** 1:1 notes and dated evidence items are the data layer. Reviews, promotion cases and growth conversations are built from them, with citations, and the EM writes the verdict.
- **v1:** five skills (`one-on-one`, `review-packet`, `upward-update`, `team-delivery-health`, `ai-adoption`). All work from pasted notes or CSV with zero integrations. Seven read-only integrations add data.
- **Guardrails:** notes never leave the EM's disk. Integrations are read-only and enforced by a hook. Nothing is sent. Individuals are never ranked. AI data shows only for groups of 4 or more.

## 1. Problem

| Evidence | Source |
|---|---|
| 65% of engineering leaders report growing scope; 52% of EMs took on more reports; 22% show critical burnout | [LeadDev 2025](https://leaddev.com/the-engineering-leadership-report-2025), [The New Stack](https://thenewstack.io/tech-hiring-improves-but-managers-overworked-says-report/) |
| EMs doing hands-on technical work rose from 20% to 35% in a year | [LeadDev 2026](https://leaddev.com/management/engineering-managers-are-back-in-the-codebase) |
| 63% of developers say leaders do not understand their challenges (up from 44%) | [Atlassian DevEx 2025](https://www.atlassian.com/blog/developer/developer-experience-report-2025) |
| Reports rate about half of their 1:1s as less than ideal; managers overrate them | [Rogelberg via Psychology Today](https://www.psychologytoday.com/us/blog/platform-for-success/202407/how-to-improve-frustrating-meetings-with-direct-reports) |
| Women get vaguer, more personality-based review feedback | [Correll et al., Stanford GSB](https://gsb.stanford.edu/insights/language-gender-bias-performance-reviews), [Textio 2024](https://textio.com/hubfs/Language%20Bias%20in%20Performance%20Feedback%202024.pdf) |
| 78% of managers used AI on reviews; 16% of ICs were told; 34% saw more generic feedback | [TechRadar on Highwire 2026](https://www.techradar.com/ai-platforms-assistants/huge-numbers-of-managers-admit-to-using-ai-to-convincingly-draft-or-revise-performance-reviews-and-i-fear-it-will-only-accelerate-the-death-of-traditional-hr) |
| AI raises throughput and instability together; team comparisons and targets are misuse | [DORA 2025](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report), [DX on misuse](https://newsletter.getdx.com/p/misuse-dora) |
| Individual AI-usage leaderboards were gamed within days | [Computing 2026](https://www.computing.co.uk/news-analysis/2026/tokenmaxxing-ai-use-as-status-symbol) |

**Market gap.** The paid tools are Swarmia, LinearB, Jellyfish, DX (now owned by Atlassian), Lattice, 15Five, Fellow, Spinach and Hypercontext. All are priced per seat, at roughly $4 to $45 per person per month. Delivery tools default to person-level views. HR tools stop at forms. Anthropic's `knowledge-work-plugins` has `engineering` (for individual contributors) and `human-resources` (for HR staff), but nothing for the EM ([research.md 3a](research.md#3a-competitive-landscape)).

## 2. Audience

- **Primary:** EMs with 6 to 15 reports, often also coding, and wary of surveillance tools.
- **Secondary:** tech leads and directors who run 1:1s or write upward updates.
- **Not for:** HR teams, executives who want cross-team league tables, or anyone wanting per-engineer output scores.

## 3. Principles

| Principle | What it means in practice |
|---|---|
| Local-first | People notes are markdown on the EM's disk, in a folder the EM picks. No telemetry, analytics or cloud storage. |
| Evidence, not verdicts | Every claim cites a dated source. Rating, verdict, PIP and promotion decision fields are left blank. |
| Team-level metrics | Delivery and AI numbers are team aggregates with a written narrative. There are no red/green tiles and no cross-team leaderboard. |
| No ranking | Per-person data appears only in that person's `one-on-one` and `review-packet` output. Nothing sorts or compares engineers by output. |
| Minimum group size 4 | Any AI-adoption cell under 4 people is suppressed. A cell is also suppressed when subtracting it from a total would expose a group under 4. |
| Human sends everything | Outputs are drafts. The tool never posts, sends, comments or writes to Slack, email, Teams or trackers. |
| Works with nothing | Every skill runs from pasted notes or CSV. Integrations add data and are never required. |
| Not legal or HR advice | Review packets, promotion cases, anything on underperformance, wellbeing or burnout, and the governance kit all end with "check with your HR or legal team". |

## 4. Ranked tool catalogue

Ranking weighs frequency × pain, how much the job depends on the 1:1 data layer, and the size of the gap in existing tools. Frequency (F) and pain (P) run from 1 to 5. The citation column points to sections of [research.md](research.md): `R1.2` means Part 1, section 2.

| # | EM job | F | P | What the tool does (inputs to outputs) | Phase | Sources |
|---|---|---|---|---|---|---|
| 1 | 1:1 continuity and prep | 5 | 3 | Running doc, recent PRs and tickets, calendar to a prep sheet with open threads, actions, themes, goals and overdue flags | **v1** | R1.1, [Gallup](https://gallup.com/workplace/350057/gallup-finds-silver-bullet-coach-once-per-week.aspx), [Hogan](https://www.range.co/templates/lara-hogan-first-one-on-one-meeting) |
| 2 | Weekly upward update | 5 | 3 | Tracker, GitHub and named public channels to exec and engineering drafts covering done, slipped and why, risks, asks and items gone quiet | **v1** | R2.1 |
| 3 | Review evidence pack | 2 | 5 | Notes, PRs, reviews given, incidents and tickets to an SBI evidence table mapped to the ladder, with a bias and vagueness lint and blank rating | **v1** | R1.2, [Correll](https://gsb.stanford.edu/insights/language-gender-bias-performance-reviews) |
| 4 | Promotion case | 2 | 4 | The same evidence mapped to the target level, with a gap list | **v1** (in `review-packet`) | R1.4 |
| 5 | Team delivery health | 4 | 3 | GitHub, tracker and calendar to DORA five keys, PR flow, meeting load and a written narrative with likely causes | **v1** | R2.5, R2.6, R2.10, [DORA](https://dora.dev/guides/dora-metrics-four-keys) |
| 6 | Team AI adoption and ROI | 3 | 4 | Usage CSV, spend CSV and GitHub to adoption, ROI, quality risk and a governance kit, all at k ≥ 4 | **v1** | R3b, [METR](https://cybernews.com/news/ai-tools-software-developers/), [Faros](https://faros.ai/research) |
| 7 | Meeting load and focus | 5 | 4 | Calendar to team meeting hours, focus-block share and low-value recurring meetings | v1 (in #5) | R2.10, [MS WTI](https://www.axios.com/2025/06/17/microsoft-remote-work-meetings) |
| 8 | Cross-team dependencies | 4 | 4 | Blocked links and review requests to a dependency register with ages and nudge drafts | Phase 2 | R2.4 |
| 9 | On-call health | 4 | 4 | Pager export and rotation to pages per shift, off-hours share and noisy alerts, per rotation | Phase 2 | R2.7, [Google SRE](https://sre.google/sre-book/being-on-call/) |
| 10 | Feedback rehearsal | 4 | 3 | The EM's observation restructured as observation, impact and request, with a judgement-word lint and a BICEPS prompt | Phase 2 | R1.6, [Hogan](https://larahogan.me/blog/feedback-equation/) |
| 11 | Underperformance record | 2 | 5 | A dated record of expectations set, support offered and change seen, plus a checklist. No risk scores | Phase 2 | R1.7, [LeadDev](https://leaddev.com/management/the-relentless-rise-of-the-pip) |
| 12 | Postmortem draft and action ageing | 3 | 4 | Incident channel and timeline to a blameless draft, with open actions by age | Phase 2 | R2.3, [incident.io](https://incident.io/blog/why-do-post-mortem-action-items-fail-how-to-make-incident-follow-ups-actually-get-done) |
| 13 | Hiring loop kit | 3 | 4 | Role and rubric to a loop plan, question bank, scorecards and a written-first debrief | Phase 2 | R1.5, [Larson](https://lethain.com/designing-interview-loops/) |
| 14 | Capacity planning | 4 | 3 | PTO, meetings, on-call and sprint history to team capacity and a buffer drawn from history | Phase 3 | R2.2 |
| 15 | Onboarding plan | 2 | 3 | Team template and first 1:1 to a 30/60/90 plan and check-in prompts | Phase 3 | R1.8 |
| 16 | Tech debt register | 3 | 4 | Debt labels, hotspots and incidents to a register and a leadership case | Phase 3 | R2.8 |
| 17 | Calibration prep (own team) | 2 | 4 | Evidence packs to a one-page summary per person and a text-versus-rating self-check | Phase 3 | R1.3 |
| 18 | Delegation matching | 3 | 3 | The EM's task list and reports' goals to suggested matches | Phase 3 | R1.10 |
| 19 | Team health pulse | 3 | 4 | An opt-in anonymous check-in on Maslach areas to themes over time | Phase 3 | R1.9 |
| 20 | RFC review | 2 | 3 | RFC markdown to a completeness check, open questions and missing reviewers | Phase 3 | R2.9 |
| 21 | Headcount case | 1 | 4 | Capacity, on-call and roadmap to a one-page business case | Phase 3 | R2.11 |

## 5. v1 scope: five skills

Every skill has a paste-in mode, cites a source for each fact, and ends with a "What I could not see" list of missing data.

| Skill | Inputs (zero-integration form) | Outputs | Integrations used |
|---|---|---|---|
| `one-on-one` | Person note; pasted PR, ticket or calendar export | Prep sheet: since last time, open threads, actions due (both sides), recurring themes, career goals progress, suggested questions; next 1:1 date and missed/overdue flag; appends the session to the running doc after the EM confirms | GitHub, Linear or Jira, Google Calendar, Outlook |
| `review-packet` | Person note; evidence items; ladder file (or the built-in generic ladder); period | Evidence pack per competency in situation, behaviour and impact form, each item with source, date and link; coverage gaps by competency and month (to counter recency bias); language lint for vague, personality and gendered terms; blank rating and verdict; promotion case variant against a target level | GitHub (PRs, reviews given), Linear or Jira, Slack or Teams (public channel threads the EM names) |
| `upward-update` | Pasted tracker CSV and PR list; last week's update | Exec version (5 bullets, asks first) and engineering version: done, slipped and why, risks, asks, items quiet for 10+ days, decisions and blockers from named public channels | GitHub, Linear or Jira, Slack, Teams |
| `team-delivery-health` | GitHub CSV (PRs, deploys or releases); calendar ICS or CSV | DORA five keys and PR flow as team medians and p75 with a 4 to 12 week trend; team meeting hours and focus-block share; a written narrative with likely causes and questions to ask the team; every proxy labelled | GitHub, Linear or Jira, Google Calendar, Outlook |
| `ai-adoption` | Usage CSV (from tool admin consoles); spend CSV; GitHub PR list | Adoption rate and an enablement plan for the whole team; spend against cycle time, review load, defect and revert rate; churn and reverts on AI-heavy changes; governance kit (policy template, approved tools register, risk checklist). Groups under 4 are suppressed with a stated reason | GitHub (AI-assisted PR labels and co-author trailers) |

**Shared evidence item schema** (feeds `one-on-one` and `review-packet`):

| Field | Type | Notes |
|---|---|---|
| `id` | string | Stable, such as `ev-2026-09-14-pr-412` |
| `person` | string | Person slug |
| `source` | enum | `note`, `github`, `linear`, `jira`, `slack`, `teams`, `calendar`, `manual` |
| `date` | ISO date | Date of the behaviour, not the capture |
| `link` | URL or null | Required when the source is not `note` or `manual` |
| `situation` | text | Context, facts only |
| `behaviour` | text | What the person did, observable |
| `impact` | text | Effect on team, users or business |
| `competency` | string or null | Ladder key, set by the EM or suggested |
| `captured` | ISO date | When it was recorded |

## 6. Roadmap (planned, not built)

| Phase | Order | Items |
|---|---|---|
| 2 | Ranked | 1. Cross-team dependency register 2. On-call health 3. Feedback rehearsal 4. Underperformance record 5. Postmortem draft and action ageing 6. Hiring loop kit |
| 3 | Ranked | 1. Capacity planning 2. Onboarding plan 3. Tech debt register 4. Calibration prep 5. Delegation matching 6. Team health pulse 7. RFC review 8. Headcount case |

Phase 2 items reuse v1 data (notes, evidence, PR flow, calendar). Phase 3 items need new inputs or carry higher misuse risk: the pulse could turn into another survey nobody acts on ([Culture Amp](https://www.cultureamp.com/blog/from-our-ceo-people-dont-get-survey-fatigue-they-get-lack-of-action-fatigue)).

## 7. Architecture

### 7.1 Plugin layout

```
em-tools/
  .claude-plugin/plugin.json       name em-tools, userConfig
  .mcp.json                        official servers + own server
  hooks/hooks.json                 PreToolUse read-only guard
  hooks/guard.mjs                  allowlist check (Node, no deps)
  skills/<5 skills>/SKILL.md       open SKILL.md standard
  skills/<skill>/references/       templates, ladder, lint word lists
  server/dist/em-tools-server.mjs  prebuilt single-file bundle (not bin/)
  server/src/                      TypeScript source
  fixtures/  scripts/lint  tests/       examples/ is generated locally, never committed
  README.md  CONNECTORS.md  docs/spec.md  docs/research.md
```

### 7.2 Official MCP servers (verified 2026-10-23)

| Source | Server and endpoint | Auth | Read-only mechanism |
|---|---|---|---|
| GitHub | `https://api.githubcopilot.com/mcp/` | OAuth | Server-side `X-MCP-Readonly: true` header plus toolsets `repos,pull_requests,issues`; hook allowlist as a second layer |
| Jira | Atlassian Rovo `https://mcp.atlassian.com/v2/mcp?tools=all` (GA) | OAuth 2.1 | Hook allowlist; also blocks the `execute` meta-tool; a read-only scoped token is optional |
| Linear | `https://mcp.linear.app/mcp` | OAuth | Hook allowlist (a `/readonly` path is unverified) |
| Google Calendar | `https://calendarmcp.googleapis.com/mcp/v1` (live-probed) | OAuth via a Google Cloud project | Hook allowlist of 5 read tools (`readOnlyHint: true`) |
| Slack | `https://mcp.slack.com/mcp` | OAuth; workspace admin must approve | Hook allowlist of `slack_search_*` and `slack_read_*` |
| Outlook and Teams | Microsoft Work IQ, local `@microsoft/workiq@1.0.1` via `server/workiq-launch.mjs`, started only when enabled (public preview; hosted `https://workiq.svc.cloud.microsoft/mcp` also exists) | Entra ID with tenant admin consent and an M365 Copilot licence per user | Hook allowlist of the read tools (`ask`, `list_agents`, `ask_work_iq`, `fetch_work_iq` and similar); entity, action and `accept_eula` tools blocked |

**Gaps:** every source has an official server, but Microsoft's needs a paid licence and admin consent, and Slack's needs admin approval. The fallback is CSV or ICS export, documented per source in `CONNECTORS.md`.

### 7.3 How write tools are blocked

A plugin cannot ship permission deny rules: only `agent` and `subagentStatusLine` take effect from plugin settings ([docs](https://code.claude.com/docs/en/plugins-reference)). So enforcement has four layers:

1. **Server-side read-only** where it exists (GitHub).
2. **Plugin PreToolUse hook, default deny.** It matches `mcp__plugin_em-tools_.*`. Any tool not on a per-server read allowlist is denied with exit code 2, so new or renamed write tools are blocked by default. Calls to integrations not listed in `enabled_integrations` are also denied.
3. **Skill-scoped hooks** (SKILL.md `hooks`). While an em-tools skill runs, they also deny write and send tools on any other MCP server, such as a claude.ai connector the EM already has.
4. **Documented deny rules** in `CONNECTORS.md` for EMs who want a permanent setting-level block.

### 7.4 Own MCP server (`em-tools-server`)

It is a local stdio server written in TypeScript and bundled to a single prebuilt `.mjs` file that runs on Node 20 or later. It does nothing beyond these two jobs:

| Group | Tools | Rules |
|---|---|---|
| Notes | `notes_list_people`, `notes_read_person`, `notes_append_entry`, `notes_add_evidence`, `notes_update_frontmatter`, `notes_list_evidence` | Reads and writes only inside `notes_folder`. Append and update only; there is no delete tool. Refuses to start if the folder is inside the plugin data or plugin root folders. Writes a `.bak` before each change |
| Metrics | `metrics_dora`, `metrics_pr_flow`, `metrics_meeting_load`, `metrics_ai_adoption` | Pure functions over JSON or CSV input. `metrics_ai_adoption` enforces k ≥ 4, including complement suppression, and returns no per-person rows |

### 7.5 Storage format

```
<notes_folder>/
  team.md                 members, sub-teams, 1:1 cadence, ladder path
  ladder.md               optional; generic ladder used if absent
  people/<slug>.md        one file per person
  drafts/YYYY-MM-DD-<skill>.md   saved outputs (optional)
```

`people/<slug>.md` has YAML frontmatter (`name`, `slug`, `role`, `level`, `team`, `start_date`, `one_on_one_cadence`, `career_goals`, `feedback_preferences`). The body has four sections: `## Log` (dated entries, newest first), `## Open threads`, `## Actions` (checkboxes with owner and due date) and `## Evidence` (one YAML block per evidence item). Plain markdown keeps the notes readable, easy to diff, and portable to any editor.

### 7.6 userConfig (asked at install, no defaults)

| Key | Type | Required | Purpose |
|---|---|---|---|
| `locale` | string | yes | BCP 47 tag such as `en-GB` or `en-US`. Sets spelling, date format and voice of every output |
| `notes_folder` | directory | yes | Where people notes live. Must sit outside the plugin data folder, which is deleted on uninstall |
| `enabled_integrations` | string, multiple | no | Any of `github`, `jira`, `linear`, `google_calendar`, `outlook`, `slack`, `teams`. Empty means paste-in only |

There are no tokens in `userConfig`. Every integration signs in through its own OAuth flow.

### 7.7 Three ways to ship, one source

| Surface | What works |
|---|---|
| Claude Code and Claude desktop | Everything: skills, hooks, own server, official servers |
| Other agents that read SKILL.md | Skills, and the own server if the agent speaks MCP. The hook guard is Claude Code only, so the README tells users to connect read-only servers |
| Claude on the web (no disk, no local MCP) | Paste-in mode only. Nothing is stored, and the README says so |

## 8. Risks and open questions

| # | Risk or question | Mitigation or proposal |
|---|---|---|
| 1 | Microsoft and Slack servers need admin consent and (for Microsoft) a paid licence. Personal accounts may not be able to test them | Fixtures cover them. Live test covers GitHub plus Linear or Jira only |
| 2 | Hooks only run in Claude Code. Other agents rely on the user's server config | Document read-only setup per source. GitHub's server-side read-only works everywhere |
| 3 | Change failure rate from GitHub alone is a proxy (reverts, hotfix labels) with no validated source | Label it a proxy in every output and accept incident issues when present |
| 4 | Detecting AI-assisted changes is error-prone | Use only explicit signals (the `claude-code-assisted` label, co-author trailers, tool CSVs) and report them as team aggregates |
| 5 | Vendor AI usage APIs return per-person rows | The server aggregates in memory and never writes per-person AI rows to disk |
| 6 | Prompt injection in Slack or GitHub text asking the agent to post or write | The default-deny hook, plus the rule that tool output is data, not instructions |
| 7 | Node 20 is required for the own server | Check at startup with a clear message. Skills still run in paste-in mode without it |
| 8 | **Open (Ryan):** is k = 4 right? The legacy Copilot API used 5 | Proposal: 4, as briefed, set as a constant in one place |
| 9 | **Open (Ryan):** should `locale` be free text or a fixed picker? | Proposal: free text with validation, since a picker cannot cover every locale |
| 10 | **Open (Ryan):** live test with Linear or Jira, and which personal accounts? | Needed before Phase B step "live test" |

## 9. Phase 2 spec (draft for approval, 2026-10-24)

Six skills, in roadmap order. About 1,300 words, readable in about 6 minutes. The v1 principles apply unchanged. Each skill works from pasted notes or CSV with zero integrations, cites every fact, produces drafts only, and never ranks people.

### 9.1 Summary

| # | Skill | Job it does | Main inputs | New data source | Est. build |
|---|---|---|---|---|---|
| 1 | `dependency-register` | Track what the team waits on from other teams, and what others wait on from us | Tracker `blocked_by` links and labels, PR review requests to other teams, named public channels | None (GitHub, Linear, Jira, Slack, Teams from v1) | 45 min |
| 2 | `oncall-health` | Show on-call load per rotation, and the noisy alerts behind it | Pager and alert export, rotation schedule, incidents | PagerDuty, incident.io | 60 min |
| 3 | `feedback-rehearsal` | Turn the EM's own observation into observation, impact and request, and rehearse the conversation | The EM's text, the person's feedback preferences | None | 30 min |
| 4 | `underperformance-record` | Keep a dated, factual record of expectations set, support offered and change seen | The EM's notes, person file | None | 45 min |
| 5 | `postmortem-draft` | Draft a blameless postmortem and track the age of its actions | Incident channel export, alert timeline, linked PRs and deploys | incident.io, PagerDuty | 60 min |
| 6 | `hiring-loop-kit` | Plan a structured interview loop and run a written-first debrief | Role, level rubric, interviewer pool, written scorecards | Ashby or Greenhouse (optional) | 60 min |

Build plan: one `feature/<skill>` branch and PR per skill, in this order. Each adds fixtures for Team A and Team B, a test for any new server maths, and lint rules where the skill adds a risk.

### 9.2 Skill specs

**1. dependency-register**
- **Outputs:** a register table with item, the team we wait on (or that waits on us), since when, age in days, next ask and source link; aging alerts at 5 and 10 working days; a nudge draft per stale item for the EM to send; a "blocked time" share of cycle time as a team figure.
- **Rules:** items, not people. A person is named only as the owner of an ask, if the source names one. Nudges are drafts.
- **Server:** `metrics_dependency_age` (pure: age, blocked share). Register saved as `dependencies.md` in the notes folder after the EM confirms.

**2. oncall-health**
- **Outputs:** per rotation: pages per week, off-hours share, incidents per 12 on-call hours, the number of 12-hour windows with more than 2 incidents (a count, never dates), mean time to acknowledge, and the top 10 noisy or unactionable alerts by count. A narrative set against Google SRE guidance (at most 25% of time on call, at most about 2 incidents per 12-hour shift). Shifts of any length (24-hour, week-long) are split into 12-hour windows before comparing, and the output states the rotation's shift length.
- **Rules:** never per person. No shift dates or names in the output, because a dated shift identifies who was on call. A rotation with fewer than 4 people shows rotation totals only.
- **Server:** `metrics_oncall` (pure, team aggregates; drops responder fields on input).

**3. feedback-rehearsal**
- **Outputs:** the EM's observation restructured as observation, impact and question or request (Lara Hogan's feedback equation); flags for judgement, personality and coded words (reusing the v1 language list); a note on which core need it may touch (BICEPS: belonging, improvement, choice, equality, predictability, significance); 3 likely responses with a calm reply to each.
- **Rules:** uses only what the EM wrote. Never invents behaviour or impact. Never stored unless the EM asks, and then as a log entry in the person's file.
- **Server:** none new.

**4. underperformance-record**
- **Outputs:** a dated record of what was expected, when and how it was communicated, the support offered, and the change seen since. A checklist covering: expectation in writing, skill gap or clarity gap, support offered, HR involved per local policy. A gaps list of missing dates or missing written follow-ups.
- **Rules:** no risk scores, predictions, PIP recommendations or verdicts. Facts in the EM's words, with dates. Every output ends with "check with your HR or legal team". Never touches wellbeing details beyond "raised on <date>".
- **Storage (the EM chooses):** on first use the skill asks where records go, and saves the answer as `expectations_storage` in `team.md`. The EM can change it at any time.
  - `person-file`: an append-only `## Expectations` section in `people/<slug>.md`.
  - `separate-file`: an append-only `people/<slug>.expectations.md`, so the main person file can be shared or opened without it.
  - Both go through a new `notes_add_expectation` tool. Switching never moves or deletes existing records; the skill reads both places.

**5. postmortem-draft**
- **Outputs:** a blameless draft with summary, impact, timeline, contributing factors (systems and conditions, never names), what went well, and actions with an owner role and due date. A monthly "open actions by age" table across incidents.
- **Rules:** no individual named in causes or timeline (roles only, such as "on-call engineer"). Actions are drafted for the EM to copy into the tracker, never created. A lint rule checks drafts for person names.
- **Server:** `metrics_action_age` (pure).

**6. hiring-loop-kit**
- **Outputs:** a loop plan mapping competencies to interviews; a fixed question bank per competency; scorecard templates; interviewer assignments the EM confirms; a debrief agenda that collects written scores before any discussion; a funnel tally from counts the EM gives.
- **Rules:** never scores, ranks or recommends a candidate. Candidate notes stay local, in `hiring/<role>/` in the notes folder. The skill reminds the EM of their organisation's retention policy, and em-tools still never deletes files itself.
- **Server:** `notes_*` support for `hiring/` files, append-only.

### 9.3 New data sources (checked 2026-10-24)

| Source | Official MCP server | Auth | Read-only mechanism | Used by |
|---|---|---|---|---|
| PagerDuty | Yes. Hosted at `mcp.pagerduty.com`, plus a local server | Hosted: OAuth. Local: user API token | The local server is read-only by default and needs `--enable-write-tools` to write. The hosted server has no tool filtering, so the hook allowlist applies | oncall-health, postmortem-draft |
| incident.io | Yes. Hosted at `https://mcp.incident.io/mcp` | OAuth | None found. Hook allowlist; declaring, acknowledging and editing are blocked | oncall-health, postmortem-draft |
| Ashby | Yes, open beta | OAuth with user permissions | Hook allowlist | hiring-loop-kit (optional) |
| Greenhouse | Reported open beta, unverified | Admin-set scopes | Hook allowlist plus read-only scopes | hiring-loop-kit (optional) |
| Opsgenie | Not supported. End of support is 5 April 2027; its features move to Jira Service Management | n/a | n/a | CSV fallback only |

Sources are in [research.md, Part 5](research.md#part-5-phase-2-data-sources).

### 9.4 Phase 2 risks and open questions

| # | Risk or question | Proposal |
|---|---|---|
| 1 | Underperformance records are the most sensitive data em-tools will hold | The EM chooses person file or separate file on first use (decided by Ryan, 2026-10-24). Append-only, with the HR line on every output |
| 2 | Candidate data belongs to people outside the team, and retention rules vary by organisation | Stays in Phase 2 (decided by Ryan, 2026-10-24). Local only, under `hiring/`. Remind the EM of retention, but never auto-delete |
| 3 | On-call rotations are small, so shift-level data identifies people | Rotation totals only; no shift dates; rotations under 4 people get totals only |
| 4 | The hosted PagerDuty server has no read-only switch | Default-deny hook allowlist, as in v1. Document the local read-only server as an option |
| 5 | Postmortems can drift into blame through names in the timeline | Roles, not names, plus a lint rule on drafts |

## 10. Phase 3 spec (draft for approval, 2026-10-24)

Eight skills, in roadmap order. About 1,500 words, readable in about 7 minutes. The v1 principles apply unchanged: each skill works from pasted notes or CSV with zero integrations, cites every fact, produces drafts only, and never ranks people. Phase 3 carries more misuse risk than Phase 2, so each spec names the misuse it guards against.

### 10.1 Summary

| # | Skill | Job it does | Main inputs | New data source | Est. build |
|---|---|---|---|---|---|
| 1 | `capacity-plan` | Team capacity for the next sprint or quarter, with explicit deductions and a buffer drawn from history | Members, PTO and holidays, meeting load, on-call shifts, last 3 to 5 sprints | Calendar out-of-office events; Linear cycles; Jira sprints (export until verified) | 60 min |
| 2 | `onboarding-plan` | A 30/60/90 plan for a new joiner, with check-in prompts | Team template, first 1:1 answers, ladder | None | 30 min |
| 3 | `tech-debt-register` | A debt register with business-impact phrasing, allocation against target, and a leadership case | Debt-labelled issues, code hotspots, incidents | Local `git log` (read-only) | 60 min |
| 4 | `calibration-prep` | A one-page evidence summary per person on the EM's own team, plus a text-versus-rating self-check | review-packet evidence, the EM's draft ratings | None | 45 min |
| 5 | `delegation-board` | Match the EM's tasks to reports' stated growth goals | The EM's task list, career goals from person files | None | 30 min |
| 6 | `team-pulse` | Themes over time from an opt-in anonymous check-in on the six Maslach areas | A no-names survey export | None (the EM's own survey tool) | 45 min |
| 7 | `rfc-review` | A completeness check, open questions and missing reviewers for an RFC | RFC markdown, CODEOWNERS, the team's template | None (GitHub from v1) | 30 min |
| 8 | `headcount-case` | A one-page business case built from team-level evidence | Capacity, on-call, debt allocation, roadmap | None | 45 min |

Build plan: one `feature/<skill>` branch and PR per skill, in this order. Each adds fixtures for Team A and Team B, a test for any new server maths, and lint rules where the skill adds a risk.

### 10.2 Skill specs

**1. capacity-plan**
- **Outputs:** team capacity for the period, in hours, worked out in one unit:
  1. **Available hours** = (members × working days in the period, minus person-days of PTO and public holidays) × working hours per day (default 8, stated).
  2. **Minus meetings:** the team's average meeting hours per person per week (from the meeting-load maths) × people × weeks in the period.
  3. **Minus on-call:** on-call time that falls inside working hours in the period, from the schedule, × an on-call load factor (default 0.3, stated: research puts on-call at 20 to 30% of one engineer's time). Nights and weekends are not working time, so they are not deducted.
  4. **Times a focus factor** (default 0.7, stated) for context switching and review time.
  5. **Buffer for unplanned work:** the unplanned share of completed work over the last 3 to 5 sprints, not a fixed 20%.
- **Points (only if the team estimates in points):** never converted from hours. The range is the team's completed points over the last 3 to 5 sprints, scaled by this period's available hours over each past sprint's available hours, then reduced by the same buffer. A carryover and overcommit warning when planned work exceeds the range.
- **Rules:** team totals only. PTO is shown as person-days off, never who is off or when. No per-person velocity, ever.
- **Server:** `metrics_capacity` (pure). Reuses the meeting-load and on-call maths.
- **Misuse it guards against:** turning capacity into per-person utilisation targets.

**2. onboarding-plan**
- **Outputs:** a 30/60/90 plan with milestones the new joiner agrees to (first PR, first on-call shadow, owning a small area), a buddy checklist, and dated check-in questions for the 1:1s. Built from the team template in `team.md`, the first 1:1 answers (Lara Hogan's questions) and the ladder.
- **Rules:** milestones are outcomes the joiner agreed to, never activity counts (no PRs per week). Saved only as a person-file log entry after the EM confirms.
- **Server:** none new.
- **Misuse it guards against:** activity quotas dressed up as onboarding.

**3. tech-debt-register**
- **Outputs:** a register of debt items (from tracker labels, TODO and FIXME scans, and hotspots) with age, the business impact in plain words, linked incidents, and a suggested next step. Hotspots: files that change often and are large, from `git log` on the EM's local clone. Debt allocation per sprint against a target the EM sets. A one-page case for leadership.
- **Rules:** files, services and items, never authors. `git log` is read without author fields. The skill runs only fixed, read-only git commands, or the EM pastes their output.
- **Server:** `metrics_hotspots` and `metrics_debt_allocation` (pure).
- **Misuse it guards against:** blaming whoever touched a hotspot.

**4. calibration-prep**
- **Outputs:** one page per person on the EM's own team: the claim the EM wants to make, the 3 strongest dated evidence items, the ladder mapping, and the known gaps. A self-check per person: does the EM's draft rating match the density and level of the evidence, and how many personality or vague words are in the text (the v1 language list).
- **Rules:** one person per page. No cross-person table, ranking, distribution curve or suggested rating. The EM's rating is their own input and is never changed or proposed. Ends with the HR line.
- **Server:** none new (reads `notes_list_evidence`).
- **Misuse it guards against:** forced ranking and rating trades in the calibration room.

**5. delegation-board**
- **Outputs:** the EM's "only I can do this" list capped at 5; the rest as delegation candidates; for each, a suggested match to a report whose stated career goal it serves, with a check-in date.
- **Rules:** matches come only from goals the person stated in their file, never from output data. Suggestions only; the EM decides and asks the person.
- **Server:** none new.
- **Misuse it guards against:** dumping work on whoever looks least busy.

**6. team-pulse**
- **Outputs:** themes over time on Maslach's six areas (workload, control, reward, community, fairness, values) from a check-in the team opts into; month-on-month direction; 2 or 3 discussion prompts for the retro.
- **Rules:** the EM runs the check-in in the survey tool their organisation already uses, with no names collected. em-tools only reads the export. Any period or area with fewer than 4 responses is suppressed. No per-person burnout labels and no keystroke, commit or calendar monitoring. Ends with the HR line when it touches wellbeing or burnout.
- **Server:** `metrics_pulse` (pure, k of 4 suppression).
- **Misuse it guards against:** de-anonymising respondents, or a survey nobody acts on.

**7. rfc-review**
- **Outputs:** a completeness check against the team's RFC template (summary, problem, proposal, success criteria, rollout, dependencies, risks), open questions pulled from the text, suggested reviewers from CODEOWNERS for the paths it touches, and a review-by date. After launch, an optional check of whether the doc still matches what shipped.
- **Rules:** reviews the document, never its author. Comments are drafts for the EM to post.
- **Server:** none new.

**8. headcount-case**
- **Outputs:** a one-page case: problem, evidence (capacity shortfall, on-call load against SRE guidance, unplanned work share, debt allocation shortfall), options including "do nothing", cost, and the risk of each.
- **Rules:** team-level data only. No individual's performance or workload is used as evidence. Costs are the EM's figures. Ends with a reminder to check budget and HR process.
- **Server:** none new (reads the outputs of skills 1 and 3 and oncall-health).

### 10.3 New data sources (checked 2026-10-24)

| Source | Mechanism | Read-only control | Used by |
|---|---|---|---|
| Google Calendar out-of-office | `outOfOffice` event type through the existing Calendar MCP server | Hook allowlist (v1); write tools blocked | capacity-plan |
| Outlook out-of-office | Show-as `oof` through Work IQ, or an ICS export | Hook allowlist (v1) | capacity-plan |
| Linear cycles | `list_cycles` on the existing Linear server | Add to the allowlist | capacity-plan, tech-debt-register |
| Jira sprints | Reported Rovo tools `listJiraBoardSprints`, `getJiraBoardSprintData`; `manageJiraSprint` writes. Unverified | Export until verified; `manageJiraSprint` stays blocked | capacity-plan |
| Local git history | `git log --numstat` on the EM's own clone, author fields dropped | Fixed read-only command, or pasted output | tech-debt-register |
| Survey export | CSV from the organisation's own survey tool, no names | Aggregated in memory, k of 4 | team-pulse |

Sources are in [research.md, Part 6](research.md#part-6-phase-3-data-sources).

### 10.4 Phase 3 risks and open questions

| # | Risk or question | Proposal |
|---|---|---|
| 1 | Calibration prep could feed forced ranking | One page per person, no cross-person view, no suggested ratings, HR line |
| 2 | Pulse free-text comments can identify the writer by style | Show themes only, paraphrased, never verbatim quotes; suppress below 4 responses |
| 3 | Running `git log` is a new kind of local command | A fixed read-only command on a path the EM names, or pasted output; never `git` writes or network calls |
| 4 | Who is off, and when, is personal | Capacity shows person-days off as a team total only |
| 5 | Headcount cases tempt using one person's overload as evidence | Team-level data only; the lint rule from team outputs applies |
| 6 | Jira sprint tool names are unverified | Export first; add the read tools to the allowlist once seen live in `/mcp` |
