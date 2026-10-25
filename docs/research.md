# em-tools research notes

Compiled 2026-10-23 as the evidence base for [spec.md](spec.md). The spec carries the decisions; this file carries the detail and the source links.

## How to read this

- **Ratings.** F is frequency (1 rare, 5 weekly or more). P is pain (1 low, 5 high). They are judgement calls informed by the sources, not survey results.
- **Source quality.** The research ran from a sandbox that blocked many vendor and primary-report sites (dora.dev, atlassian.com, pagerduty.com, linear.app, learn.microsoft.com, docs.slack.dev and others). Where a page could not be opened, the fact comes from search-result text about that URL or from secondary coverage, and it is marked "secondary" or "UNVERIFIED". Check those against the primary source before quoting them in product copy.
- **Seed claims.** The project brief came with seed research. Each seed claim is given a verdict in [Part 1](#seed-claim-verdicts).

## Contents

1. [Part 1: People work](#part-1-people-work)
2. [Part 2: Delivery work](#part-2-delivery-work)
3. [Part 3: Market and AI adoption](#part-3-market-and-ai-adoption)
4. [Part 4: Integrations and plugin platform](#part-4-integrations-and-plugin-platform)
5. [Part 5: Phase 2 data sources](#part-5-phase-2-data-sources)
6. [Part 6: Phase 3 data sources](#part-6-phase-3-data-sources)

---

# Part 1: People work


### 0. Context: EM workload in 2025 and 2026

- LeadDev Engineering Leadership Report 2025: 617 respondents, fielded 14 to 27 March 2025, about 37% were managers of engineers. The editor frames it around tightening budgets and generative AI pushing managers toward efficiency. ([LeadDev report page](https://leaddev.com/the-engineering-leadership-report-2025), [2025 PDF](https://leaddev.com/wp-content/uploads/2025/07/LeadDev-Engineering-Leadership-Report-2025.pdf))
- Scope creep: 65% of respondents at all levels reported an increase in scope, 40% took on more direct reports, and only 3% reported a decrease in scope. ([LeadDev report page](https://leaddev.com/the-engineering-leadership-report-2025))
- Among engineering managers specifically, 52% took on more direct reports in the past year. 22% of orgs added managerial roles while 28% cut them. 48% of tech leads without management duties worked more hours than a year earlier. ([The New Stack](https://thenewstack.io/tech-hiring-improves-but-managers-overworked-says-report/)). Note: the 40% (all respondents) and 52% (EMs only) figures are not contradictory, but cite them with their denominators.
- Burnout (Maslach Burnout Inventory, same 617-person sample): 22% critical, 24% moderate, 33% low, 21% healthy. 38% reported working longer hours, 7% less. ([LeadDev burnout article](https://leaddev.com/culture/engineering-burnout-rising-2025-layoffs-reshape-tech-industry)). The "79% have some burnout" figure seen online is a forum sum, not a report finding ([forum post](https://tianpan.co/forum/t/engineering-managers-are-burning-out-65-have-expanded-responsibilities-only-3-saw-scope-decrease/415)).
- 2026 report: EMs reporting more hands-on technical work rose from 20% (2025) to 35% (2026). ([LeadDev 2026 PDF](https://leaddev.com/wp-content/uploads/2026/06/ENGINEERING_LEADERSHIP_REPORT_2026_FINAL.pdf), [LeadDev: EMs back in the codebase](https://leaddev.com/management/engineering-managers-are-back-in-the-codebase))
- Pragmatic Engineer: Big Tech and scaleups have been flattening orgs and shedding EMs; remaining managers carry more and "the job's harder than before". Orosz advises staying hands-on. ([Pragmatic Engineer: ZIRP EMs](https://newsletter.pragmaticengineer.com/p/zirp-engineering-managers), [Staying hands-on](https://newsletter.pragmaticengineer.com/p/staying-hands-on))
- Implication for em-tools: the target user (6 to 15 reports) has less time per report than a few years ago and is increasingly also coding. Tools must save minutes per report per week, not add process.

### 1. 1:1s (continuity, prep, action tracking)

- Rogelberg's research: weekly is the most preferred cadence across levels and countries, but slightly under half of employees actually get weekly 1:1s. Recommended: weekly 30 minutes, or biweekly 45 to 60. (secondary: [Leader's Edge, March 2024](https://www.leadersedge.com/brokerage-ops/one-meeting-people-want-more-of), [Psychology Today, July 2024](https://www.psychologytoday.com/us/blog/platform-for-success/202407/how-to-improve-frustrating-meetings-with-direct-reports))
- Reports rate nearly half of their 1:1s as less than ideal, and managers overestimate how well they go. The top sign of a poor 1:1 is a manager who talks too much. The agenda should be co-created and led by the report. (secondary: [Psychology Today](https://www.psychologytoday.com/us/blog/platform-for-success/202407/how-to-improve-frustrating-meetings-with-direct-reports), [Coaching for Leaders podcast](https://coachingforleaders.com/podcast/how-to-structure-one-on-one-meetings-steven-rogelberg/))
- A dissertation (N = 303) found 1:1 quality, especially relations-oriented manager behavior, mattered more for engagement than quantity, provided meetings happen at least monthly. ([UNC Charlotte](https://graduateschool.charlotte.edu/?p=3491))
- Gallup: at least one meaningful conversation per week with each report raises engagement and surfaces issues before they escalate. ([Fortune, June 2024](https://www.fortune.com/2024/06/12/managers-employee-engagement-burnout-gallup-research), [Gallup](https://gallup.com/workplace/350057/gallup-finds-silver-bullet-coach-once-per-week.aspx))
- Lara Hogan's "Questions for our first 1:1" (2016): capture how someone likes feedback and recognition, what makes them grumpy and how to help, and their goals, because she found this information helps later with feedback, recognition, and support. ([range.co template](https://www.range.co/templates/lara-hogan-first-one-on-one-meeting), [Hogan follow-up post](https://larahogan.me/blog/one-on-one-question-anniversary/))
- Practitioner guidance (not research): document decisions, track action items, and open the next 1:1 by following up on them. ([Localytics: six recipes](https://eng.localytics.com/six-recipes-for-software-managers/), [Dave O'Dea](https://daveodea.substack.com/p/effective-one-on-ones-a-guide-for))
- SEED CLAIM "1:1 notes are the input most other people work depends on": UNVERIFIED as stated. No source found. It is a reasonable design premise (review evidence, feedback examples, promotion cases, and burnout signals all surface in 1:1s, and the recency-bias mitigations below all call for year-round notes) but present it as our thesis, not as a finding.
- Tool idea: per-report running file. Input: the manager's own notes plus open action items. Output: a prep sheet (last 3 sessions, open commitments from both sides, the report's stated goals and feedback preferences, topics not touched in N weeks). Never infers mood or scores the person.
- F 5, P 3.

### 2. Performance reviews

- Recency bias: commonly defined as weighting the latest period over the full window, a form of availability bias. Mitigation in nearly every source is a year-round evidence log. ([Culture Amp](https://cultureamp.com/blog/performance-review-bias), [Flevy](https://flevy.com/blog/recency-bias-in-performance-reviews-and-the-evidence-trail-that-corrects-it/)). Claims such as "managers cannot recall behavior past 60 to 90 days" and "78% of managers admit recency influence" have no traceable primary source: do not cite. ([Hyring glossary](https://hyring.com/free-hr-toolkit/hr-glossary/recency-bias))
- Correll et al. (American Sociological Review, 2021, Fortune 500 tech company): women got more vague feedback and more personality criticism; men were more often called visionary. Managers softened criticism of women with praise but then gave them lower ratings than the text implied. Bias concentrates in personality, future potential, and "exceptionalism". ([Stanford GSB](https://gsb.stanford.edu/insights/language-gender-bias-performance-reviews))
- Correll and Simard (HBR, 2016): men's feedback had granular, actionable detail; women's was vague, which makes it hard to argue for advancement without documented accomplishments. ([Slate summary](https://www.slate.com/blogs/xx_factor/2016/05/02/stanford_researchers_say_women_get_vague_feedback_in_performance_reviews.html))
- Textio (2022, 25,000+ people, 250+ orgs; 2024 update): women get 22% more personality feedback; women were 7x more likely to be called "opinionated" and 11x more likely "abrasive"; high-performing women get as much personality feedback as low performers. ([Textio 2024 PDF](https://textio.com/hubfs/Language%20Bias%20in%20Performance%20Feedback%202024.pdf), [Textio blog](https://textio.com/blog/job-performance-feedback-is-heavily-biased-new-textio-report), [HR Brew, Aug 2024](https://www.hr-brew.com/stories/2024/08/26/race-and-gender-stereotypes-permeate-in-performance-reviews-study-finds))
- Pragmatic Engineer: clear levels and competencies are the prerequisite for fair reviews; writing feedback ahead of time reduces bias; no surprises at review time. ([Performance reviews for software engineers](https://blog.pragmaticengineer.com/performance-reviews-for-software-engineers/), [Uber-era template](https://blog.pragmaticengineer.com/performance-review-example-and-template-for-engineering-managers/))
- Julia Evans' brag document: a running record so the report is not relying on memory; share it with the manager to make advocacy easier. ([jvns.ca](https://jvns.ca/blog/brag-documents/))
- Lara Hogan on making reviews "predictable, fair, and motivating". ([Hogan feedback resources](https://larahogan.me/resources/feedback/))
- SEED CLAIM "engineers resent reviews the manager clearly did not write": PARTLY SUPPORTED, by survey data (not engineer-specific). Kickresume (1,365 employees): ~72% suspect their manager used AI, 30% said parts felt generic or overly polished ([People Matters](https://sea.peoplemattersglobal.com/news/performance-management/72percent-of-employees-suspect-their-managers-use-ai-to-evaluate-performance-report-47521)). Highwire (Aug 2026, 1,034 US professionals): 78% of managers used AI for feedback or reviews in the past year, only 16% of ICs were told; 34% said feedback got more generic ([TechRadar](https://www.techradar.com/ai-platforms-assistants/huge-numbers-of-managers-admit-to-using-ai-to-convincingly-draft-or-revise-performance-reviews-and-i-fear-it-will-only-accelerate-the-death-of-traditional-hr), [Raconteur](https://www.raconteur.net/future-of-work/ai-performance-reviews)). Anecdote: employees angry at feedback copied quarter to quarter, suspected ChatGPT ([thelayoff.com thread](https://www.thelayoff.com/p/@av+1kabar89v)). Direct "resentment" wording is not measured; say "reviews perceived as generic or AI-written erode trust".
- Deloitte 2025 Human Capital Trends: 61% of managers and 72% of workers cannot confidently say they trust their performance process (secondary: [Raconteur](https://www.raconteur.net/future-of-work/ai-performance-reviews)).
- Tool idea: evidence assembler. Input: the manager's 1:1 notes, the report's brag doc, the level rubric. Output: a dated evidence table per competency with gaps flagged ("no evidence for Q1", "only last 6 weeks cited"), plus a language lint for vague or personality words (Correll and Textio categories). The manager writes the review; the tool never drafts the rating.
- F 2 (1 to 2 cycles per year, but 6 to 15 at once), P 5.

### 3. Calibration

- Calibration is meant to remove bias, but practitioner sources say it can add new bias (managers trading ratings, rewarding the visible over the valuable, recency and halo effects). Sessions where no rating changes are a warning sign. (vendor sources: [Confirm](https://www.confirm.com/blog/performance-calibration-meetings), [KnowledgeCity](https://www.knowledgecity.com/blog/hr-performance-calibration-manager-bias/), [StaffCircle](https://www.staffcircle.com/blogs/performance-review-calibration/))
- An HBR analysis (Jan 2024, secondary) calls calibration a second rating layer that can compound bias. ([Confirm guide](https://www.confirm.com/blog/performance-calibration-guide))
- Correll's finding that ratings diverged from review text is directly relevant: calibration should check text-rating consistency. ([Stanford GSB](https://gsb.stanford.edu/insights/language-gender-bias-performance-reviews))
- No Larson or Pragmatic Engineer piece on calibration surfaced in search (Pragmatic Engineer paid community thread on unfavorable reviews exists: [link](https://newsletter.pragmaticengineer.com/p/community-thread-perf-reviews)).
- Tool idea: calibration prep pack for the manager's own team only. Input: the manager's evidence tables. Output: one-page per person (claim, 3 strongest dated examples, rubric mapping, known gaps) and a self-check ("ratings vs evidence density", "personality words per review"). No cross-team ranking, no suggested ratings.
- F 2, P 4.

### 4. Promotion cases

- Correll and Simard: without specific, documented accomplishments it is hard for a manager to make the case for advancement. ([Slate summary](https://www.slate.com/blogs/xx_factor/2016/05/02/stanford_researchers_say_women_get_vague_feedback_in_performance_reviews.html))
- Practitioner guidance: rest the case on a rubric and shipped work, not adjectives like "strong leadership"; map each achievement to outcome, metric, impact and to the level criteria; make a specific ask for a named level in a named cycle. ([Rework playbook](https://resources.rework.com/guides/engineering-manager-playbooks/promotion-and-performance-conversations), [MangoApps template](https://www.mangoapps.com/templates/forms/promotion-nomination-packet/run), [Taro Q&A](https://www.jointaro.com/question/j2Tbk0hiRDIGC3GdpaeY/how-to-leave-trace-of-evidence-for-promotion/))
- Staff-level packets hinge on multi-team scope and direction-setting over 6 to 9 months. ([JobRise](https://jobrise.io/en/blog/staff-engineer-promotion-faang-2026/), [Taro](https://www.jointaro.com/question/j2Tbk0hiRDIGC3GdpaeY/how-to-leave-trace-of-evidence-for-promotion/))
- No Larson piece on promotion packets surfaced; do not attribute.
- Tool idea: promo case builder. Input: evidence log, brag doc, target level rubric. Output: a draft skeleton mapped criterion by criterion with "evidence strength" shown as counts and dates, and an explicit "missing evidence" list the manager can work on with the report months ahead.
- F 2, P 4.

### 5. Hiring and interview loops (Will Larson)

- Larson: instrument the hiring funnel before redesigning a loop; review metrics after 10 to 20 runs of a new loop; each debrief should surface rubric and question improvements. ([Designing interview loops](https://lethain.com/designing-interview-loops/))
- Common hiring manager mistakes include overly fluid loops and interviewers inventing questions on the fly. ([lethain.com](https://lethain.com/common-hiring-manager-mistakes/))
- For EM loops that reject everyone, look at offer rate among onsite candidates. ([Getting to yes](https://lethain.com/getting-to-yes/)). Treat the loop as a conversion funnel and be humane to candidates. ([Running a humane interview process](https://lethain.com/running-humane-interview-process/), [hiring index](https://lethain.com/hiring-writing-index/))
- Research: Sackett et al. (2022) meta-analysis ranks structured interviews as the most predictive selection method (about .42), well above unstructured (about .19, secondary figure). ([SIOP](https://www.siop.org/tip-article/is-cognitive-ability-the-best-predictor-of-job-performance), [Test Partnership](https://www.testpartnership.com/academy/structured-interview.html))
- Practice: independent written scorecards before the group debrief to avoid anchoring. ([Holloway](https://holloway.com/g/technical-recruiting-hiring/sections/the-interview-loop))
- Tool idea: loop kit. Input: role description, level rubric. Output: interviewer assignments per competency, fixed question bank, scorecard template, and a debrief agenda that collects written scores first. Optional local funnel tally from the manager's own counts. Never scores a candidate.
- F 3 (bursty), P 4.

### 6. Feedback (Lara Hogan, BICEPS)

- Hogan's feedback equation: Observation (bare facts, no judgment) + Impact (the effect the recipient cares about most) + Question or Request. In writing, include observation and impact; save the question for the conversation. ([larahogan.me](https://larahogan.me/blog/feedback-equation/), [LeadDev](https://leaddev.com/mentoring-coaching-feedback/growing-teams-and-culture-actionable-feedback))
- BICEPS (Paloma Medina): six core needs at work: Belonging, Improvement/progress, Choice, Equality/fairness, Predictability, Significance. Useful for diagnosing why a change or piece of feedback lands badly. Primary Medina source not found in search. ([Matthias Ott summary](https://matthiasott.com/notes/biceps-six-core-needs-for-humans-at-work))
- Vague feedback is itself a bias vector (Correll, Textio above), so "specific and behavioral" is both a quality and a fairness rule.
- Tool idea: feedback drafter that only restructures the manager's own observation into O + I + Q, flags judgment words and personality labels, and suggests which BICEPS need may be at stake. Output stays a draft for the manager to say in person.
- F 4, P 3.

### 7. Underperformance

- Common failure is avoidance: managers turn a blind eye or sideline the person. ([Social Media Today](https://www.socialmediatoday.com/content/performance-management-are-you-looking-other-way))
- New EMs confuse improvement with high potential, which delays action. ([manager.dev](https://newsletter.manager.dev/p/the-1-new-engineering-managers-mistake))
- PIPs are rarely ideal for engineering output; root causes are often unclear expectations or skill mismatch; regular 1:1 feedback is the alternative. ([LeadDev: rise of the PIP](https://leaddev.com/management/the-relentless-rise-of-the-pip))
- An HBR case reports an internal audit where only 15% completed PIPs and 60% were terminated, and managers said they lacked training (case study, not general rate). ([SMU repository](https://ink.library.smu.edu.sg/lkcsb_research/7804))
- Raise issues as soon as they arise; set clear written expectations. ([UN guide](https://hr.un.org/sites/hr.un.org/files/file/refmaterials/documents/Addressing_and_Resolving_Underperformance.pdf), [Aston University](https://www.aston.ac.uk/sites/default/files/2022-08/274627-Guide%20for%20managers%20on%20performance%20management.pdf))
- Tool idea: expectations tracker. Input: the manager's notes on a specific concern. Output: a dated record of what was asked, when, what support was offered, and what changed, plus a checklist (expectation stated in writing? skill or clarity problem? HR looped in per policy?). No "risk score", no prediction.
- F 2, P 5.

### 8. Onboarding

- Gallup: only 12% of employees strongly agree their org onboards well; 29% of new hires feel fully prepared after onboarding (2019, not since updated). ([Gallup PDF](https://www.gallup.com:443/file/workplace/247076/Gallup_Perspective_on_Creating_an_Exceptional_Onboarding_Journey_for_Your_New_Employees.pdf))
- Time to productivity for engineers: commonly 3 to 9 months; a Linux Foundation 2024 figure of 4.8 months (secondary). DX: daily AI users reached their 10th PR in ~49 days vs ~91 days. ([TechClass](https://www.techclass.com/resources/learning-and-development-articles/onboarding-for-technical-teams-reducing-time-to-full-productivity), [Stealth Agents](https://stealthagents.com/research/remote-onboarding-time-to-productivity-statistics-2026), [DX](https://getdx.com/blog/ai-cuts-developer-onboarding-time-in-half/))
- Hogan's first-1:1 questions are the natural day-one input. ([range.co](https://www.range.co/templates/lara-hogan-first-one-on-one-meeting))
- Tool idea: 30/60/90 plan generator from a team template plus first-1:1 answers; outputs checklist, buddy prompts, and scheduled check-in questions. Measures milestones the new hire agreed to, not activity.
- F 2 (per hire), P 3.

### 9. Team health and burnout signals

- Maslach's six drivers: workload, control, reward, community, fairness, values; fixes often need little money. ([CNBC](https://www.cnbc.com/2022/11/14/balance-these-6-things-to-reverse-burnout-get-your-energy-back.html), [UMN Extension](https://extension.umn.edu/two-you-video-series/burnout-dr-christina-maslach))
- LeadDev 2025: 22% critical burnout, 38% working longer hours (section 0).
- Stack Overflow survey coverage: only ~20 to 22% of developers report being happy; burnout or fatigue is the top reason for complacency (~21%); year labels in coverage are inconsistent. ([ShiftMag](https://shiftmag.dev/unhappy-developers-stack-overflow-survey-3896), [LinearB](https://linearb.io/blog/stack-overflow-developer-survey-friction-job-satisfaction))
- Gallup: manager engagement is falling (27% in 2025, secondary). ([TSA Group](https://tsagroup.com.au/the-secret-to-engagement-one-meaningful-conversation-a-week/))
- Tool idea: self-reported pulse only. Input: optional anonymous team check-in mapped to the six Maslach areas, plus the manager's own 1:1 notes. Output: themes over time ("workload raised by 4 people this month") for discussion. No keystroke, commit, or calendar monitoring; no per-person burnout labels.
- F 3, P 4.

### 10. Delegation

- List what only you can do (approvals, reviews, offers, 1:1s, career growth); if more than five, cap at five and move the rest to "candidates for delegation". ([LeadDev: Delegation 101](https://leaddev.com/management/delegation-101-figuring-out-what-delegate), [Auth0: What can only you do?](https://auth0.com/blog/what-can-only-you-do/))
- Delegation feels inefficient short term but is a long-term investment; the shift is from "I do the hard stuff" to "the right stuff gets done well". ([DEV Community](https://dev.to/pixari/delegation-for-engineering-managers-what-to-let-go-first-4if1), [EM Diary](https://emdiary.substack.com/p/3-rules-of-delegation))
- With 52% of EMs gaining reports and more EMs coding again (section 0), delegation pressure is rising.
- Tool idea: delegation board. Input: the manager's task list and each report's stated growth goals (from 1:1 notes). Output: suggested matches ("this task fits X's goal of leading a design review"), with a check-in date. Suggestions only; the manager decides.
- F 3, P 3.

### Seed claim verdicts

| Claim | Verdict |
|---|---|
| Engineers resent reviews the manager clearly did not write | Partly supported: surveys show reviews perceived as AI-written or generic reduce trust (72% suspect AI; 30% felt generic; 16% told). Not engineer-specific; "resent" not measured. |
| 1:1 notes are the input most other people work depends on | Unverified: our design thesis, consistent with recency-bias mitigation advice, but no study says this. |
| Recency bias in reviews | Supported as a widely recognized bias; specific stats circulating online are unsourced. |
| Vague and gendered language in reviews | Supported: Correll et al. 2021 (ASR), Correll and Simard 2016 (HBR), Textio 2022 and 2024. |
| LeadDev 2025: EM workload and burnout | Supported: 65% more scope, 40% (all) or 52% (EMs) more reports, 22% critical burnout. |

---

# Part 2: Delivery work


Note on sourcing: several primary domains (dora.dev, atlassian.com, pagerduty.com, sre.google, linearb.io) could not be fetched from this environment, so some figures below come from search-result summaries of those pages or from secondary coverage. Items marked "(secondary)" should be checked against the primary report before being quoted in product copy.

---

### 0. Atlassian State of Developer Experience Report 2025 (cross-cutting)

- Survey of 3,500 developers and managers across six countries. ([Atlassian blog](https://www.atlassian.com/blog/developer/developer-experience-report-2025))
- 99% of developers report time savings from AI tools; 68% save more than 10 hours a week. ([Atlassian blog](https://www.atlassian.com/blog/developer/developer-experience-report-2025))
- Time lost: 50% lose 10+ hours a week and 90% lose 6+ hours, largely to organizational inefficiencies; the 10+ hours share rose from 33% the prior year. ([Atlassian blog](https://www.atlassian.com/blog/developer/developer-experience-report-2025), [LeadDev](https://leaddev.com/velocity/ai-productivity-gains-are-being-offset-by-organizational-bottlenecks))
- Top friction: finding information, adapting to new technology, and context switching between tools. ([Atlassian report page](https://www.atlassian.com/teams/software-development/state-of-developer-experience-2025), [The New Stack](https://thenewstack.io/fixing-engineerings-biggest-time-suck-finding-information/))
- Developers spend only about 16% of their time coding, so coding assistants do not touch the main friction. ([Atlassian blog](https://www.atlassian.com/blog/developer/developer-experience-report-2025))
- Leaders vs devs disconnect: 63% of developers say leaders do not understand their challenges, up from 44% the year before. ([Atlassian blog](https://www.atlassian.com/blog/developer/developer-experience-report-2025), [ShiftMag](https://shiftmag.dev/the-number-one-productivity-killer-for-devs-finding-information-5700/))
- Cost framing (secondary calculation, not Atlassian's): 10 lost hours a week is about $7.9M a year for a 500-developer company. ([Diginomica](https://diginomica.com/node/29030))
- Related, Atlassian State of Teams 2025 (secondary): a quarter of the workweek is spent searching for information; only 20% of knowledge workers say their team has an effective way to inform other teams of decisions affecting them; 50% say teams unknowingly duplicated work. ([Unleash](https://www.unleash.ai/artificial-intelligence/atlassian-ai-could-help-workers-stop-wasting-2-4-billion-hours-searching-for-information-every-year/), [Petri](https://petri.com/inefficient-information-management-costing-businesses/))

**Tool idea:** a quarterly "friction pulse" (short anonymous team survey plus repo/calendar signals) that produces a team-level friction report the EM can share upward, closing the 63% perception gap with data.

---

### 1. Weekly status / upward updates

**Frequency: 5 (weekly, often plus monthly/quarterly rollups). Pain: 3.**

- No credible 2024 to 2026 survey isolates EM time on status reports; available numbers are vendor testimonials (for example a VP spending 3 to 4 hours weekly, reduced to about 1 hour with automation). ([Maestro](https://getmaestro.ai/use-cases/automate-status-reports))
- Adjacent data: ClickUp reports 58% of a project manager's week goes to admin tasks (PMs, not EMs). ([ClickUp](https://clickup.com/learn/?p=70856))
- EM scope is growing: in LeadDev's 2025 survey of 617 leaders, 65% report expanded responsibilities and 40% manage more direct reports; 38% work longer hours. ([LeadDev](https://leaddev.com/management/why-would-anyone-be-an-engineering-manager-in-2026), [LeadDev burnout](https://leaddev.com/culture/engineering-burnout-rising-2025-layoffs-reshape-tech-industry), [LeadDev report PDF](https://leaddev.com/wp-content/uploads/2025/07/LeadDev-Engineering-Leadership-Report-2025.pdf))
- Good practice: fixed structure every week (overall RAG, wins, focus, risks with mitigation, decisions needed, asks); put asks first; RAG per dimension (scope, schedule); report outcomes, not activity; do not keep a project green when a risk is credible. ([Status Report Survival Guide](https://projectmanagementcompass.substack.com/p/status-report-survival-guide), [GoTranscript template](https://gotranscript.com/blog/project-status-meeting-minutes-template-rag-blockers-risks-actions))

**Tool idea:** inputs: merged PRs, closed issues, milestone dates, incidents, last week's update. Outputs: a draft update in a fixed template (asks first, RAG per project with a stated reason, risks delta vs last week, "shipped" phrased as outcomes) plus an exec-length 5-bullet variant.

---

### 2. Sprint and capacity planning

**Frequency: 4 (every 1 to 2 weeks, plus quarterly). Pain: 3.**

- Common heuristics: focus factor 0.6 to 0.8 of raw hours; subtract PTO and holidays as whole days first; meetings and ceremonies about 4 to 6 hours a week per engineer; on-call can consume 20 to 30% of one engineer's bandwidth. These are vendor rules of thumb, not research. ([GitScrum capacity](https://docs.gitscrum.com/en/how-to/sprint-capacity-planning), [DEV Community guide](https://dev.to/projiq/how-to-run-an-effective-sprint-planning-meeting-2026-guide-4l8b))
- Reserve 15 to 20% for unplanned work, or use the unplanned share actually observed last sprint as next sprint's buffer. ([DEV Community guide](https://dev.to/projiq/how-to-run-an-effective-sprint-planning-meeting-2026-guide-4l8b), [Scrum.org](https://www.scrum.org/node/42379))
- Worked example: 5 people, 2 weeks: 47 available days x 5.5 h x 75% is about 194 hours, well below raw availability. ([GitScrum](https://docs.gitscrum.com/en/how-to/planning-sprints-with-accurate-capacity))
- Unplanned work is real cost: PagerDuty's (older, 2020) study found 62% of North American IT pros spend 100+ hours a year on disruptive unplanned work. ([PagerDuty](https://www.pagerduty.com/newsroom/time-critical-unplanned-work-new-report/))

**Tool idea:** inputs: team calendar (PTO, holidays, recurring meetings), on-call schedule, last 3 to 5 sprints of planned vs completed and unplanned items. Outputs: team capacity in hours/points with explicit deductions, a recommended unplanned buffer from history, and a carryover/overcommit warning. Team totals only.

---

### 3. Postmortems / incident reviews

**Frequency: 3 (per significant incident, monthly review). Pain: 4.**

- PagerDuty 2024 (500 IT leaders, Censuswide, May to June 2024): customer-facing incidents up 43% year over year; average incident takes 175 minutes to resolve; downtime costs $4,537 per minute, so nearly $794,000 per incident; about 25 high-priority incidents a year per org. ([PagerDuty newsroom](https://pagerduty.com/newsroom/study-cost-of-incidents), [PagerDuty PDF](https://s206.q4cdn.com/635206389/files/doc_news/2024/06/1/PagerDuty-Survey-Reveals-Customer-Facing-Incidents-Increased-by-43-During-the-Past-Year-Each-Incident-Costs-Nearly-800000-2024.pdf))
- PagerDuty Dec 2024: 88% of executives expect another major incident within 12 months. ([Silicon UK](https://www.silicon.co.uk/press-release/not-if-but-when-88-of-execs-expect-a-major-incident-in-2025-as-large-as-the-july-global-it-outage))
- Manual postmortem write-up takes 60 to 90 minutes per incident; automated timeline capture cuts it to about 15 (vendor claim). ([incident.io](https://incident.io/blog/best-postmortem-software-for-on-call-engineers-2026-guide))
- Follow-ups fail when owned by a team ("belongs to nobody") or live in a closed doc; assign a named owner and date, keep actions in the normal tracker, and limit the number of actions to resist recency bias. ([incident.io action items](https://incident.io/blog/why-do-post-mortem-action-items-fail-how-to-make-incident-follow-ups-actually-get-done), [incident.io meeting guide](https://incident.io/blog/a-guide-to-post-mortem-meetings))
- Blameless culture: assume people acted in good faith with the information they had; naming individuals makes teams risk-averse. Define postmortem trigger criteria before incidents happen. ([Google SRE workbook](https://sre.google/workbook/postmortem-culture/), [USENIX](https://www.usenix.org/publications/login/spring2017/lunney))

**Tool idea:** inputs: incident channel export, alert timeline, linked PRs/deploys. Outputs: blameless postmortem draft (timeline, impact, contributing factors, no names in causes), a short action list pushed to the tracker with owner and due date, and a monthly "open action items by age" report across incidents.

---

### 4. Cross-team dependencies

**Frequency: 4 (weekly). Pain: 4.**

- Atlassian DevEx 2025 lists poor cross-team collaboration and fragmented workflows among blockers. ([Atlassian blog](https://www.atlassian.com/blog/developer/developer-experience-report-2025))
- Only 20% of knowledge workers feel their team has an effective way to tell other teams about decisions that affect them; 70% say functions operate in silos (secondary). ([Unleash](https://unleash.ai/artificial-intelligence/news/atlassian-ai-could-help-workers-stop-wasting-2-4-billion-hours-searching-for-information-every-year))
- Academic case: in large-scale continuous engineering, requests to a shared core system involve significant waiting; supplier dependencies can stall work for days to months. ([arXiv 2504.21437](https://arxiv.org/pdf/2504.21437))
- Metric: blocked time as a share of cycle time; sustained values above roughly 20 to 30% signal systemic dependency problems (heuristic). ([Count](https://count.co/metric/blocked-time-percentage)); rising WIP and review latency are leading indicators. ([minware](https://www.minware.com/blog/tracking-cross-team-dependencies))

**Tool idea:** inputs: issues with "blocked by" links or labels across repos/teams, PR review requests to other teams. Outputs: dependency register (who we wait on, since when, next ask), aging alerts, and a ready-to-send nudge message per stale dependency.

---

### 5. DORA four keys (and the 2025 report)

**Frequency: 3 (monthly/quarterly review). Pain: 3 (computing them is fiddly; interpreting them is harder).**

#### Definitions (current DORA wording)
- Grouped into **throughput** and **instability**. ([dora.dev four keys guide](https://dora.dev/guides/dora-metrics-four-keys), [Flagsmith](https://www.flagsmith.com/blog/dora-metrics))
- **Change lead time:** the time it takes for a code commit or change to be successfully deployed to production. ([Scrum.org](https://www.scrum.org/node/103923)) Tools differ on the start point: first commit of the PR ([Swarmia](https://help.swarmia.com/definitions/dora-metrics/change-lead-time)), or merge time ([GitLab docs](https://git.math.duke.edu/gitlab/help/user/analytics/dora_metrics.md)); report median and p90. ([Metabase](https://www.metabase.com/metrics/lead-time-for-changes))
- **Deployment frequency:** how often application changes are deployed to production. ([dora.dev](https://dora.dev/guides/dora-metrics-four-keys))
- **Change fail rate:** percentage of deployments that cause a production failure requiring immediate intervention (hotfix or rollback). ([dora.dev](https://dora.dev/guides/dora-metrics-four-keys))
- **Failed deployment recovery time:** time to recover from a failed deployment needing immediate intervention (formerly time to restore / MTTR). ([dora.dev](https://dora.dev/guides/dora-metrics-four-keys), [Flagsmith](https://www.flagsmith.com/blog/dora-metrics))
- **Deployment rework rate (fifth metric):** unplanned deployments resulting from a production incident divided by total deployments; introduced 2024, benchmarked 2025. ([CD Foundation](https://cd.foundation/blog/2025/10/16/dora-5-metrics/), [Faros](https://www.faros.ai/blog/5th-dora-metric-rework-rate-track-it-now), [dora.dev history](https://dora.dev/guides/dora-metrics/history/))

#### Calculating from GitHub data
- Deploys: use GitHub Deployments targeting prod-like environments (prod, production, live), or treat PRs merged to a release branch, or tags/releases, as deploys. ([github-dora-metrics](https://mscord.duckdns.org/mikaelvesavuori/github-dora-metrics), [Waydev docs](https://docs.waydev.co/docs/dora-metrics-setup))
- Lead time: first commit (or merge) to deployment start; deployment "last updated" is unreliable as a completion time. ([github-dora-metrics](https://mscord.duckdns.org/mikaelvesavuori/github-dora-metrics))
- Change fail rate: Four Keys counts deployments and incidents and takes the ratio, which needs a link from deploys to incidents (for example incident-labelled issues); it assumes failures are user-facing and long enough to raise an incident, and counts incidents, not duration. ([The New Stack](https://thenewstack.io/how-to-do-dora-metrics-right/), [Four Keys fork](https://github.com/mvsantos/fourkeys))
- Proxies when incident data is missing: a deploy is "failed" if followed by a revert PR, a hotfix-labelled PR, or a rollback deploy, within a window; a standard rollback process that tags failed PRs makes this reliable. Some tools use failed workflow runs on main, which is a weaker proxy. ([The New Stack](https://thenewstack.io/how-to-do-dora-metrics-right/), [dora-the-explora](https://github.com/ministryofjustice/dora-the-explora)) No source validated the revert/hotfix heuristic, so label it "proxy" in output.
- Recovery time proxy: failed deploy time to the next successful deploy (or revert merge) on the same service.

#### DORA 2025 report key findings
- Nearly 5,000 respondents; 90% use AI at work; over 80% believe AI raised their productivity; 30% report little or no trust in AI-generated code. ([Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report))
- AI now correlates positively with throughput and product performance, but still negatively with delivery stability; without strong testing, version control and fast feedback, more change volume means more instability. Core thesis: AI amplifies what is already there. ([Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report))
- 90% of organizations have at least one internal platform; platform quality is linked to realizing AI's value. ([Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report))
- DORA AI Capabilities Model (seven): clear and communicated AI stance; healthy data ecosystems; AI-accessible internal data; strong version control practices; working in small batches; user-centric focus; quality internal platforms. ([Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model))
- Low/medium/high/elite tiers replaced by seven team profiles from eight measures including burnout and friction (secondary): Foundational challenges 10%, Legacy bottleneck 11%, Constrained by process 17%, High impact low cadence 7%, Stable and methodical 15%, Pragmatic performers 20%, Harmonious high-achievers 20%. Speed vs stability trade-off is described as a myth. ([Splunk](https://www.splunk.com/en_us/blog/learn/state-of-devops), [RedMonk](https://redmonk.com/rstephens/2025/12/18/dora2025/))
- Context, DORA 2024: a 25% increase in AI adoption was associated with an estimated 1.5% drop in throughput and 7.2% drop in stability, alongside +7.5% documentation quality, +3.4% code quality, +3.1% review speed. ([DORA 2024 infographic](https://dora.dev/research/2024/2024-DORA-Report-Infographic.pdf), [The New Stack](https://thenewstack.io/dora-2024-ai-and-platform-engineering-fall-short/))

#### Metric misuse
- DORA cautioned against comparing teams; league tables cause unhealthy competition (secondary). ([Critical Path](https://buttondown.com/critical-path/archive/stop-reporting-dora-start-interpreting-it/))
- Common misuse: comparing teams, setting numerical targets, effort on dashboards over improvement; all Goodhart's Law. Gaming: splitting deploys to inflate frequency, reclassifying incidents to lower change fail rate. ([DX newsletter](https://newsletter.getdx.com/p/misuse-dora), [Scrums.com](https://www.scrums.com/blog/dora-metrics-problems))
- Prefer each team's trend over time and consistent definitions. ([The New Stack](https://thenewstack.io/the-wrong-way-to-use-dora-metrics/))

**Tool idea:** inputs: GitHub deployments/releases, merged PRs, revert/hotfix labels, optional incident issues. Outputs: team-level five-metric snapshot with 4 to 12 week trend, every proxy disclosed, a "how we computed this" footnote, and no cross-team leaderboard by design.

---

### 6. PR flow metrics (cycle time, review time, PR size)

**Frequency: 4 (weekly glance, sprint retro). Pain: 3.**

- LinearB 2025 benchmarks: 6.1M+ PRs, about 3,000 teams, 32 countries; PR size is the most significant driver of velocity. ([LinearB](https://linearb.io/blog/2025-engineering-benchmarks-insights))
- Indicative P75 bands (verify on page, table rendered poorly): elite cycle time under about 26 hours; elite review time under about 3 hours, needs-focus over about 24 hours; elite PR size around 85 changes or fewer, needs-focus above about 209. ([LinearB benchmarks](https://linearb.io/engineering-benchmarks/))
- 2026 edition (8.1M+ PRs, 4,800 orgs): elite cycle time under 25 hours, good 25 to 72 hours. ([LinearB glossary](https://linearb.helpdocs.io/article/1s38stsugw-glossary-metrics))
- DORA 2025 lists "working in small batches" as an AI capability, linking PR size to AI value. ([Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model))

**Tool idea:** inputs: PR events (opened, first review, approved, merged), diff size. Outputs: team medians and p75 for pickup, review, merge and total cycle time, size distribution, list of PRs waiting for first review over 24 hours (as items, not people).

---

### 7. On-call health / burden

**Frequency: 4 (weekly rotation handoff). Pain: 4.**

- Google SRE: at most 25% of SRE time on-call; about 6 hours per incident including follow-up, so a maximum of 2 incidents per 12-hour shift; under one per shift is also wasteful. The same chapter derives rotation size from the 25% rule: at least 8 engineers for a single-site 24/7 rotation with primary and secondary on week-long shifts, or 6 per site for a dual-site team (from memory of the book; the page could not be fetched here, so check before quoting). ([Google SRE book](https://sre.google/sre-book/being-on-call/), [SRE workbook](https://sre.google/workbook/on-call/))
- PagerDuty (2021 data): significant correlation between frequency of off-hours fixing and likelihood of quitting; 2 off-hours interruptions a month per user is good, 7 bad, 19 a burnout sign. ([PagerDuty](https://www.pagerduty.com/newsroom/pagerduty-state-of-digital-operations-report-underscores-business-and-human-costs-of-pandemic/))
- incident.io on-call survey (200+ responses): about half paid for on-call, 41% not; top pains: disrupted personal life, lacking context, lack of sleep, false alerts. ([incident.io](https://incident.io/blog/uncovering-the-mysteries-of-on-call))
- 2026 survey (NeuBird): nearly 40% of orgs say over a quarter of on-call engineers show burnout symptoms; 77% of teams get 10+ alerts a day; 83% ignore alerts at least occasionally. ([IT Brief](https://itbrief.com.au/story/neubird-ai-study-finds-gap-on-incident-management-ai))

**Tool idea:** inputs: pager/alert export, rotation schedule. Outputs: per-rotation (not per-person) pages per shift, off-hours share, noisy/unactionable alert top 10, and a flag when shifts exceed 2 incidents.

---

### 8. Tech debt

**Frequency: 3 (quarterly planning, per sprint allocation). Pain: 4.**

- Stack Overflow 2024: 62.4% name technical debt as their top workplace frustration, about double the next items. ([Stack Overflow blog](https://stackoverflow.blog/2024/07/24/developers-want-more-more-more-the-2024-results-from-stack-overflow-s-annual-developer-survey))
- Chainguard (fielded Aug 2025, 1,200 respondents): two-thirds frequently hit tech debt that impacts delivery; only about 16% of the week goes to building features. ([BSSw](https://bssw.io/items/survey-engineers-want-to-code-but-spend-all-day-on-tech-debt))
- Almost a quarter of developer time reported as wasted due to tech debt. ([DX newsletter](https://newsletter.getdx.com/p/tech-debt-productivity))
- Practice: reserve about 15 to 20% of capacity (heuristic), or periodic debt sprints; track debt items' age and resolution, plus outcome metrics. ([SoftwareSeni](https://www.softwareseni.com/technical-debt-prioritisation-and-planning-strategies-that-work), [GitScrum](https://docs.gitscrum.com/en/best-practices/how-to-manage-technical-debt-sprints-effectively))

**Tool idea:** inputs: debt-labelled issues, TODO/FIXME scan, hotspots (high churn plus incident-linked files). Outputs: ranked debt register with business-impact phrasing, actual vs target allocation per sprint, and a one-page case for leadership.

---

### 9. RFC / design doc review

**Frequency: 2 to 3 (monthly per team). Pain: 3.**

- Typical sections: summary, background, problem, proposal, definition of success, plus SLAs, dependencies, load testing for services. ([Pragmatic Engineer](https://blog.pragmaticengineer.com/rfcs-and-design-docs/))
- Failure modes: documents get heavy and reviews performative ([Attentive](https://tech.attentive.com/articles/rfc-process-for-teams)); endless discussion, unclear criteria for when an RFC is needed, doc diverging from what was built ([Iver notes](https://wharf.iver.com/wharf-notes/rfc-presentation)).
- Practice: lightweight template, notify reviewers when ready, avoid consensus by exhaustion ([Attentive](https://tech.attentive.com/articles/rfc-process-for-teams)); cut detail that would not change a reviewer's vote ([Fuchsia](https://fuchsia.dev/fuchsia-src/contribute/governance/rfcs/best_practices)); catching misalignment in review is far cheaper than in production ([PointFive](https://www.pointfive.co/blog/writing-technical-specifications-the-art-of-tailoring-rfcs)).

**Tool idea:** inputs: RFC markdown. Outputs: template completeness check, open questions list, missing-reviewer/stakeholder suggestions from CODEOWNERS, review deadline tracker, and a post-ship "doc vs implementation" drift check.

---

### 10. Meeting load and focus time

**Frequency: 5 (daily). Pain: 4.**

- Microsoft Work Trend Index 2025: interrupted about every 2 minutes (275 times a day); 117 emails and 153 Teams messages a day; 57% of meetings are ad hoc; half of meetings fall in peak focus windows (9 to 11, 1 to 3); meetings after 8pm up 16%. ([Axios](https://www.axios.com/2025/06/17/microsoft-remote-work-meetings), [Unleash](https://www.unleash.ai/artificial-intelligence/microsoft-employees-are-interrupted-every-2-minutes-how-can-ai-help-us-re-focus-on-the-work-that-matters/))
- Hubstaff 2026: ICs attend about 5 meetings a week, managers about 13; about 39% of tracked time is deep focus. ([Hubstaff](https://hubstaff.com/blog/how-much-deep-work-do-employees-really-get/))
- Reclaim: 15.8 hours/week in meetings; 2+ hour deep work sessions average 2.9 to 3.7 a week vs 4.2 needed (vendor). ([Reclaim](https://reclaim.ai/blog/deep-work-trends-report), [Reclaim Next](https://reclaim.ai/blog/google-cloud-next-deep-work-trends-report))
- DORA 2025 "Constrained by process" profile (17%): excessive meetings and red tape drive burnout. ([Splunk](https://www.splunk.com/en_us/blog/learn/state-of-devops))

**Tool idea:** inputs: team calendar (aggregate). Outputs: team meeting hours, share of 2-hour focus blocks, recurring meetings with low attendance or no agenda, and a proposed "no-meeting block" schedule. Aggregate only.

---

### 11. Headcount requests

**Frequency: 1 to 2 (annual/half-year planning). Pain: 4 (high stakes).**

- Justification should tie the role to business goals, quantify benefits, state cost, explain why the team cannot absorb the work, and the risk of not hiring. ([Jodoo template](https://www.jodoo.com/ai/headcount-request-form), [SlideModel](https://slidemodel.com/templates/increase-headcount-proposal-powerpoint-template))
- Context: LeadDev 2025, 28% saw manager roles cut vs 22% added; 52% of EMs took on more reports. ([The New Stack](https://thenewstack.io/tech-hiring-improves-but-managers-overworked-says-report/))
- Engineering-specific evidence a request can draw on: on-call load vs SRE 25% guidance, unplanned work share, roadmap backlog, debt allocation shortfall (combine from sections 2, 7, 8).

**Tool idea:** inputs: capacity history, roadmap items, on-call and incident stats. Outputs: a one-page business case (problem, evidence, options incl. "do nothing", cost, impact) using team-level data only.

---

### Summary table

| Topic | F | P |
|---|---|---|
| Weekly status | 5 | 3 |
| Sprint/capacity | 4 | 3 |
| Postmortems | 3 | 4 |
| Cross-team deps | 4 | 4 |
| DORA | 3 | 3 |
| PR flow | 4 | 3 |
| On-call | 4 | 4 |
| Tech debt | 3 | 4 |
| RFC review | 2 | 3 |
| Meetings/focus | 5 | 4 |
| Headcount | 1 | 4 |

---

# Part 3: Market and AI adoption


### 3a. Competitive landscape

#### Engineering intelligence (delivery focus, priced per developer)

**Swarmia**
- Pricing: per developer per month. Aggregators list Lite at about $10 and Standard at about $39 to $45, with Enterprise quoted by sales and a free plan for teams under 10 developers ([growhackscale](https://growhackscale.com/products/swarmia), [FitGap](https://us.fitgap.com/products/010585/swarmia), [TrustRadius](https://www.trustradius.com/products/swarmia/pricing)). Vendr reports a median contract of about $14.7k/year ([Vendr](https://www.vendr.com/marketplace/swarmia)).
- Focus: delivery and developer experience (DORA, SPACE, working agreements). Its positioning is that it works as a mirror for teams, not a management scorecard ([Swarmia vs LinearB](https://www.swarmia.com/alternative/linearb/), [Swarmia git analytics](https://www.swarmia.com/git-analytics/)).
- Complaints and reputation: third-party comparisons call it the least surveillance-feeling tool in the category, with team-level metrics by default and individual data private to the individual ([wetheflywheel](https://wetheflywheel.com/en/comparisons/linearb-vs-jellyfish-vs-swarmia/)).

**LinearB**
- Pricing: free tier for about 8 to 10 contributors. Pro is about $420 per contributor per year, Enterprise about $549, and SCIM is gated to Enterprise ([Iden](https://www.idenhq.com/scim-tax/linearb), [aicoolies](https://aicoolies.com/pricing/linearb)). Usage-based credits now cover AI code review and automations ([Sacra](https://sacra.com/chat/h/873244c1-ff41-4ffb-8b07-726ff134e8a6/), [PricingSaaS](https://pricingsaas.com/companies/linearb)).
- Focus: delivery metrics plus workflow automation (gitStream PR routing).
- Complaints: comparisons say it shows individual developer metrics to managers by default, which can create surveillance concerns where trust is low. They also mention gaming and privacy concerns ([pensero](https://pensero.ai/blog/linearb-vs-swarmia), [toolradar](https://toolradar.com/compare/linearb-vs-swarmia)).

**Jellyfish**
- Pricing: per seat (engineers who contribute) plus modules, quote only ([AWS Marketplace review](https://aws.amazon.com/marketplace/reviews/reviews-list/prodview-ma7h6oqkfhuo4?page=14), [Capterra](https://www.capterra.com/p/208202/Jellyfish/)). One competitor blog cites about $360 per engineer per year, unverified ([Exceeds](https://blog.exceeds.ai/dx-competitor-pricing-2026)).
- Focus: aimed at executives and finance. It covers capacity allocation and R&D cost capitalization, and the AI Impact module is sold within the seat-priced platform ([rywalker](https://rywalker.com/research/jellyfish)).
- Complaints:
  - G2 themes include data bugs and inflexible dashboards (35 reviews) and complex setup or integration (20) ([G2](https://www.g2.com/products/jellyfish-2025-10-22/reviews)).
  - One reviewer says metrics become misleading without Jira data hygiene. Another warns it can easily be used in superficial ways to equate output with impact ([AWS Marketplace](https://aws.amazon.com/marketplace/reviews/reviews-list/prodview-ma7h6oqkfhuo4?page=3)).
  - Value for money is its lowest Capterra score, at 3.9/5 ([Capterra](https://www.capterra.com/p/208202/Jellyfish/)).
  - Jellyfish markets person-based metrics as first-class ([Jellyfish vs LinearB](https://jellyfish.co/jellyfish-vs-linearb/)).

**DX (getdx)**
- Acquisition: Atlassian agreed to buy DX for about $1B in cash and restricted stock, announced 18 September 2025 ([SiliconANGLE](https://siliconangle.com/2025/09/18/atlassian-acquires-developer-productivity-startup-dx-1b/), [DX blog](https://getdx.com/blog/dx-is-joining-atlassian/)). The deal has since closed, and DX is being folded into Atlassian's Software Collection with Bitbucket, Compass and Rovo Dev ([MarketScreener](https://uk.marketscreener.com/news/atlassian-completes-acquisition-of-dx-advancing-engineering-intelligence-for-enterprises-ce7d5fd8de89f225)). This is a lock-in risk for teams that are not on Atlassian.
- Pricing: per developer, quote only. Vendr reports a median of about $53.8k/year across 111 purchases, with a range of $21k to $129k ([Vendr](https://www.vendr.com/marketplace/dx)).
- Focus: developer experience surveys plus system data (DXI, Core 4, the AI Measurement Framework).
- Stance: DX calls using metrics to evaluate individuals "sensitive and often problematic" but acceptable "with great care" ([DX KB](https://docs.getdx.com/knowledgebase/using-dx-for-performance-assessment/)). Survey-based tools also carry a survey-fatigue risk.

**Newer entrants and others in this category**
- **Span**:
  - It launched an AI code detector in September 2025 claiming over 95% accuracy, and raised $25M (seed plus Series A) in November 2025 ([BusinessWire](https://www.businesswire.com/news/home/20251105703479/en/Span-Raises-%2425M-to-Bring-Clarity-to-Engineering-Teams-Navigating-AI-Transformation), [Sacra](https://sacra.com/c/span)).
  - A secondhand report says Hacker News testers could steer the detector, and commenters asked whether a 5% error rate is acceptable when results drive administrative consequences ([rywalker](https://rywalker.com/research/span)).
- **Faros AI**: open-source self-hosted community edition. Commercial plans start at "as low as $29 per contributor per month", and Enterprise and Ultimate tiers are quote only ([Faros pricing](https://faros.ai/pricing), [stackpick](https://stackpick.net/pricing/faros-ai/)).
- **Waydev**: about $449 per active contributor per year on Pro. View-only managers are free ([pensero](https://pensero.ai/blog/waydev-pricing)).
- **Haystack**: Growth plan at about $20 per member per month with an annual commitment ([pensero](https://pensero.ai/blog/haystack-pricing)).
- **Plandek**: from about $25 per contributor per month, no free tier ([FitGap](https://us.fitgap.com/products/plandek)).

#### People, HR and meetings (HR and manager-workflow focus, priced per employee)

- **Lattice**:
  - Pricing: per seat with a minimum annual contract of about $4,000. In July 2026, Foundations rose from $11 to $13 and Performance from $8 to $10; Goals is $8 and Engagement $4 ([noon.ai](https://www.noon.ai/blog/articles/408-lattice-pricing-2026), [UsagePricing](https://www.usagepricing.com/blueprint/activity/lattice-2026-07-15-foundations-13-performance-10)).
  - Complaints on G2 and Capterra: rigid review forms, a competency matrix that can't be customized, missed notification emails, low adoption of the Grow module, and a learning curve ([G2](https://g2.com/products/lattice-lattice/reviews?page=2), [Capterra](https://capterra.com/p/151676/Lattice/reviews/?page=8)).
- **15Five**: Engage $4, Perform $11 and Total Platform $16 per user per month. AI coaching (Kona) costs $19 per manager per month ([noon.ai](https://www.noon.ai/blog/articles/426-15five-pricing-2026)).
- **Culture Amp**:
  - Focus: engagement surveys. The standard survey has 57 questions, with a 20-question short version.
  - Survey fatigue: the vendor's own answer is "people don't get survey fatigue, they get lack of action fatigue" ([Culture Amp](https://www.cultureamp.com/blog/from-our-ceo-people-dont-get-survey-fatigue-they-get-lack-of-action-fatigue), [Infragistics case study](https://www.cultureamp.com/case-studies/infragistics)). This frames survey fatigue as a known problem, and it means em-tools should never run a survey it does not act on.
- **Oyster**: EOR and payroll, not EM tooling. Payroll is from about $29 per employee per month and EOR about $699 ([anywherer](https://www.anywherer.com/how-much-does-oyster-cost/)). It is peripheral to em-tools.
- **Fellow**: meeting and 1:1 notes. Free tier, Team about $7 to $11 per user per month, Business about $15 to $23 ([Spendflo](https://spendflo.com/vendors/fellow), [CostBench](https://www.costbench.com/software/ai-meeting-assistants/fellow-app/)).
- **Spinach**: AI meeting notes for standups, retros and agile meetings. Free Starter, Pro from $2.90 per meeting hour, Business $19 to $29 per user per month ([Spinach FAQ](https://spinach.ai/content/sprint-retro-tools)).
- **Hypercontext**: shared 1:1 agendas, still active, with no acquisition found ([Hypercontext](https://hypercontext.com/features/one-on-ones), [Capterra](https://www.capterra.com/p/141147/SoapBox/reviews/)).

#### Cross-cutting complaints

- **Surveillance and individual scorecards**:
  - Kent Beck and Gergely Orosz argue that metrics used for performance evaluation get gamed and become useless, and should only be used to find and remove impediments ([Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/measuring-developer-productivity-part-2), [LeadDev](https://leaddev.com/career-development/what-mckinsey-got-wrong-about-developer-productivity)).
  - A Gartner reviewer describes a team that over-rotated on activity numbers and dashboards, which eroded trust ([Gartner via search](https://www.gartner.com/reviews/product/linearb/alternatives)).
- **Red/green dashboards that mislead**: Jellyfish reviewers report misleading metrics when data hygiene slips ([AWS Marketplace](https://aws.amazon.com/marketplace/reviews/reviews-list/prodview-ma7h6oqkfhuo4?page=3)).
- **Cost and lock-in**:
  - Every vendor here prices per seat, and the larger ones quote only.
  - DX is now inside Atlassian.
  - No source documented data-export complaints, so lock-in is inferred from pricing and ownership, not from reviews.
- **Gap in sources**: Reddit was not reachable from the search tool, and no Hacker News thread surfaced directly, so community sentiment comes from reviews and essays.

#### Anthropic knowledge-work-plugins (anthropics/knowledge-work-plugins)

- **Listed in the README marketplace table** ([repo](https://github.com/anthropics/knowledge-work-plugins)): productivity, sales, customer-support, product-management, marketing, legal, finance, data, enterprise-search, bio-research, cowork-plugin-management.
- **Other directories**: engineering, human-resources, design, operations, small-business, partner-built, pdf-viewer.
- **engineering** ([folder](https://github.com/anthropics/knowledge-work-plugins/tree/main/engineering)):
  - Commands: /standup, /review, /debug, /architecture, /incident, /deploy-checklist.
  - Skills: code-review, incident-response, system-design, tech-debt, testing-strategy, documentation.
  - It is aimed at individual contributors and covers no 1:1s, team health or EM workflows.
- **human-resources** ([folder](https://github.com/anthropics/knowledge-work-plugins/tree/main/human-resources)):
  - Commands: /draft-offer, /onboarding, /performance-review, /policy-lookup, /comp-analysis, /people-report.
  - Skills: recruiting-pipeline, employee-handbook, compensation-benchmarking, org-planning, people-analytics, interview-prep.
  - It is written for HR, not for engineering managers, and has no 1:1 support.
- **Verdict**: nothing covers the EM seat (1:1s, team health, delivery narrative, AI adoption for a team). em-tools fills a real gap and can sit next to `engineering` and `human-resources`.

### 3b. Measuring AI coding tool adoption

#### Adoption rates

- **DORA 2025** (nearly 5,000 respondents):
  - About 90% use AI at work, up 14 points, at roughly two hours a day ([TechRepublic](https://www.techrepublic.com/article/news-dora-ai-report-2025/), [Digit](https://www.digit.fyi/ai-adoption-hits-90-among-developers-google-report-finds/)).
  - DORA describes AI as an "amplifier" of existing strengths and dysfunctions.
- **Stack Overflow 2025** (about 49k responses):
  - 84% use or plan to use AI tools, up from 76%.
  - 46% distrust the accuracy of AI output, against 31% the previous year.
  - 66% cite "almost right, but not quite" answers, and 45% say debugging AI code takes longer ([InfoWorld](https://infoworld.com/article/4031673/ai-use-among-software-developers-grows-but-trust-remains-an-issue-stack-overflow-survey.html), [ShiftMag](https://shiftmag.dev/stack-overflow-survey-2025-ai-5653/)).
  - Secondary sources disagree on the exact trust percentage (29% to 33%).
- **DX**: leading organizations reach only about 60% active usage of AI tools ([DX AI measurement framework](https://getdx.com/ai-measurement-framework/)).

#### Measuring ROI

- **DX AI Measurement Framework**: three dimensions ([DX framework](https://getdx.com/ai-measurement-framework/), [guide](https://getdx.com/blog/ai-measurement-framework-guide/)).
  - Utilization: DAU/WAU, % of PRs that are AI-assisted, % of committed code that is AI-generated, tasks given to agents.
  - Impact: time saved, satisfaction, Core 4 measures such as PR throughput and DXI.
  - Cost: whether spend and ROI are optimal.
  - It compares AI users with non-users, and heavy users with moderate users.
- **DORA AI Capabilities Model**: seven capabilities, including a clear and communicated AI stance, healthy data ecosystems, AI-accessible internal data, strong version control, a user-centric focus, and quality internal platforms ([Google Cloud blog](https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model)). The policy work in em-tools maps directly to "clear AI stance".
- **METR RCT** (Feb to Jun 2025, 16 experienced open-source developers, 246 tasks):
  - Developers were about 19% slower with AI, yet believed they were about 20% faster.
  - The perception gap is the key ROI warning: self-reported time savings are unreliable ([Cybernews](https://cybernews.com/news/ai-tools-software-developers/), [Sylvain Zircher](https://www.sylvainzircher.com/posts/the-productivity-mirage)).
  - Caveat: a small sample working in familiar repositories.
- **Faros "AI Productivity Paradox" 2025** (10,000 developers, 1,255 teams):
  - High-AI teams completed about 21% more tasks and merged about 98% more PRs.
  - Review time rose 91% and PR size 154%, with no measurable org-level DORA improvement ([Faros research](https://faros.ai/research), [DEV summary](https://dev.to/alexcloudstar/the-ai-productivity-paradox-why-developers-who-ship-more-code-are-not-actually-more-productive-12f7)).
  - The 2026 follow-up (22,000 developers) reports bugs per developer up 54% and incidents tripled ([Faros](https://www.faros.ai/comparison/github-copilot-vs-codeium)).
  - Faros sells measurement tooling.

#### Quality, churn and revert risk

- **DORA 2025**: AI adoption correlates with higher throughput and also with higher instability (more change failures and rework) ([Splunk](https://www.splunk.com/en-us/blog/learn/state-of-devops.html), [ADTmag](https://adtmag.com/Articles/2025/09/24/What-2025-DORA-Report-Means-for-Developers.aspx)).
  - Only two of the seven team archetypes gain without a higher change failure rate ([Rob Bowley](https://blog.robbowley.net/2025/10/01/dora-2025-ai-assisted-dev-report-some-benefit-most-dont/)).
  - A stable change failure rate can hide more absolute failures when deploy volume rises.
- **GitClear 2025** (211M changed lines, 2020 to 2024):
  - Duplicated code blocks rose about eightfold in 2024.
  - Moved (refactored) lines fell sharply, and copy-pasted lines exceeded moved lines for the first time.
  - Short-term churn is rising ([GitClear](https://www.gitclear.com/ai_assistant_code_quality_2025_research), [LeadDev](https://leaddev.com/software-quality/how-ai-generated-code-accelerates-technical-debt)).
  - GitClear is a vendor, and secondary sources quote the moved-code percentages inconsistently.
- **Implication for em-tools**: pair any adoption signal with team-level guardrail metrics (PR size, review time, change failure rate, revert rate, churn within 2 to 3 weeks).

#### Why individual-level AI usage tracking is harmful

- **Goodhart and Campbell effects**:
  - Token and usage leaderboards reward consumption.
  - Meta's internal token leaderboard was reportedly shut down within 48 hours in April 2026 after leaks and gaming.
  - Amazon staff reportedly ran pointless tasks to climb a usage ranking, and an executive said "don't use AI just for the sake of using AI".
  - Sources: [Computing](https://www.computing.co.uk/news-analysis/2026/tokenmaxxing-ai-use-as-status-symbol), [tianpan](https://tianpan.co/blog/2026/05/05/org-level-goodhart-gaming-ai-adoption-metrics), [Honeycomb](https://www.honeycomb.io/blog/it-can-only-goodhart-happen). These are secondary reports.
- **Usage is not productivity**: the METR perception gap and the Faros paradox show that more AI activity can coexist with slower or less stable delivery.
- **Detectors make mistakes**: a 5% misclassification rate, plus detectors that can be steered, should not feed consequences for an individual ([rywalker on Span](https://rywalker.com/research/span)).
- **Trust and culture**: the Beck and Orosz gaming argument applies directly ([Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/measuring-developer-productivity-part-2)). Developers already distrust AI output (Stack Overflow 46%), so pressure to show usage pushes them toward work they don't trust.
- **Vendor defaults are per-user**:
  - Claude Code's dashboard includes a top-contributor leaderboard ([Claude Code analytics docs](https://code.claude.com/docs/en/analytics)).
  - Cursor and the new Copilot APIs return per-user rows.
  - em-tools should therefore aggregate before showing anything.

#### Data sources and aggregation thresholds

**GitHub Copilot**
- Legacy Copilot Metrics API:
  - Team-level aggregates were returned only for teams with 5 or more members holding active licences on that day ([GitHub changelog 2024](https://github.blog/changelog/2024-04-23-github-copilot-metrics-api-now-available-in-public-beta/), [Waydev docs](https://docs.waydev.co/docs/github-copilot)).
  - Data covered direct team members only ([Swarmia help](https://help.swarmia.com/ai-assistant-metrics/github-copilot-usage-metrics)) and a 28-day window ([Hatica](https://www.hatica.io/docs/organization/copilot/)).
- The legacy APIs were retired in 2026 (user-level feature engagement and direct data access on 2 March, the Copilot Metrics API on 2 April) ([GitHub changelog](https://github.blog/changelog/2026-01-29-closing-down-notice-of-legacy-copilot-metrics-apis/)).
- Replacement usage metrics:
  - Enterprise, organization and user-level reports (1-day and 28-day), now GA ([GitHub changelog](https://github.blog/changelog/2026-02-27-copilot-metrics-is-now-generally-available)).
  - They include agent mode, the CLI and the Copilot app ([July 2026](https://github.blog/changelog/2026-07-17-github-copilot-app-now-available-in-the-usage-metrics-api)).
  - Feature engagement appears only in aggregate reports, not user-level ones ([September 2026](https://github.blog/changelog/2026-09-17-copilot-impact-dashboard-now-shows-feature-engagement)).
  - Port reports no team-level replacement ([Port docs](https://www.docs.port.io/build-your-software-catalog/sync-data-to-catalog/ai-agents/github-copilot)). Team views must therefore be built from user-level rows, so em-tools has to apply its own minimum group size.

**Cursor Admin API** (Enterprise teams)
- Endpoints: `GET /teams/members` and `POST /teams/daily-usage-data`, rate-limited to 20 requests/minute ([Cursor docs](https://cursor.com/docs/account/teams/admin-api)).
- Rows are per user per day: tabs shown and accepted, lines added and accepted, requests by mode ([Worklytics](https://www.worklytics.co/blog/export-analyze-cursor-usage-data)).
- No aggregation threshold is documented.
- Removed members drop out of daily usage ([forum](https://forum.cursor.com/t/admin-api-teams-daily-usage-data-omits-removed-members-still-returned-by-filtered-usage-events/165528)).

**Claude Code**
- Analytics Admin API: `/v1/organizations/usage_report/claude_code` ([Claude Platform docs](https://platform.claude.com/docs/en/api/claude-code-analytics-api)).
  - One record per user per day: sessions, lines added and removed, commits, PRs, tool accept/reject rates, cost and tokens by model.
  - Free to use, with up to 1 hour of delay. It covers only direct API usage, not Bedrock, Vertex or Foundry.
  - No threshold is documented.
- Team/Enterprise dashboard ([Claude Code analytics](https://code.claude.com/docs/en/analytics), [contribution metrics](https://claude.com/resources/articles/contribution-metrics)):
  - Shows accepted lines, accept rate and DAU, plus contribution metrics (beta) that label PRs "claude-code-assisted" in GitHub.
  - Includes a top-contributor leaderboard.
  - Not available with Zero Data Retention.
  - The GitHub label lets em-tools count AI-assisted PRs at team level from GitHub alone.

**Summary**: only legacy Copilot ever enforced a threshold (5). em-tools should enforce its own k-anonymity floor (for example, groups of 5 or more, suppressing smaller cells) and never show per-person rows.

#### Governance: team AI usage policy (region-neutral)

**Policy contents**
- Purpose and a clear AI stance, which is a DORA capability ([Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model)).
- Scope covering people, repositories and environments.
- A named owner and a review cadence of about six months ([MetaCTO](https://metacto.com/blogs/creating-effective-ai-usage-policies-for-development-teams), [Inology](https://www.inology.co.uk/downloads/inology-ai-policy-pack.pdf)).
- Data classification tiers ([JetBrains](https://www.jetbrains.com/pages/ai-for-engineering-teams/ai-governance/how-to-create-an-ai-usage-policy-with-template/), [Compare the Cloud](https://www.comparethecloud.net/articles/ai-acceptable-use-policy-small-uk-business-free-template-checklist)):
  - Public: any tool.
  - Internal: approved tools only.
  - Restricted (customer PII, credentials, keys, proprietary algorithms): never.
- Extra review for authentication, authorization, cryptography and payments code. Separate rules for agentic tools that run commands or open PRs. No unapproved tools in CI/CD ([MetaCTO](https://metacto.com/blogs/creating-effective-ai-usage-policies-for-development-teams)).
- Human accountability: the author owns merged code whatever tool produced it.
- A measurement clause: team-level only, never used in individual reviews.

**Approved tools register: fields per tool**
- Product and licence tier (enterprise or personal).
- Owner.
- Allowed data ceiling.
- Allowed surfaces (IDE, CLI, agent, CI).
- Data retention and training settings.
- Admin and analytics access.
- Approval date and next review date.
- Templates with a data-ceiling column already exist ([Blue Vector](https://bluevector.it.com/downloads/ai-acceptable-use-policy-template)), and policies should be treated as working documents ([Paycor](https://www.paycor.com/resource-center/articles/ai-acceptable-use-policy-template/)).

**Risk checklist**
- Prompt injection through issues, PR comments, fetched pages and agent instruction files ([OWASP AI cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Coding_with_AI_Cheat_Sheet.html), [Akto](https://www.akto.io/questions/top-security-risks-of-ai-coding-assistants-in-the-enterprise)).
- Agent permissions and auto-accept: scope the tools and constrain execution independently of the model ([Verdent](https://www.verdent.ai/de/guides/coding/secure-coding-practices)).
- Secrets: `.gitignore` does not stop an assistant reading a file, so run secret scanning on every commit ([Aurascape](https://aurascape.ai/answers/security-evaluation-ai-coding-assistants/)).
- Hallucinated or slopsquatted packages, and dependency pinning ([Aurascape](https://aurascape.ai/answers/security-evaluation-ai-coding-assistants/)).
- A licence review step for generated code. The sources here are thin, so this is flagged as a gap.
- An audit trail that can reconstruct what an agent did.
- Quality guardrails: PR size, review load and change failure rate (from the DORA and Faros findings).

---

# Part 4: Integrations and plugin platform


The sandbox egress proxy blocked many vendor doc hosts. Requests to `linear.app`, `support.atlassian.com`, `developers.google.com`, `learn.microsoft.com`, `docs.slack.dev`, `slack.com`, `docs.github.com`, `github.blog`, and `docs.cloud.google.com` were refused (CONNECT 403 / ENOTFOUND). These were reachable: `code.claude.com`, `github.com` (git clone + raw), and `calendarmcp.googleapis.com`.

Because of that, the vendor facts below come from three kinds of evidence:

1. **The vendor's own official GitHub repos.** I shallow-cloned them on 2026-10-23 and give each one's last commit date.
2. **A live, unauthenticated MCP `initialize` + `tools/list` call** against the Google Calendar endpoint.
3. **Tool names visible in this session's own claude.ai connectors** (GitHub, Linear, Google Calendar). These are marked "observed in session".

Facts that only come from web-search snippets, from pages I could not open, are marked **UNVERIFIED (search snippet only)**. No URL is cited as a source unless I opened it.

---

### 4a. Official vendor MCP servers

#### Summary table

| Source | Official MCP? | Endpoint | Transport | Auth | Status | Read-only mechanism |
|---|---|---|---|---|---|---|
| GitHub | Yes (github/github-mcp-server) | `https://api.githubcopilot.com/mcp/` (remote); `ghcr.io/github/github-mcp-server` (local) | Remote streamable HTTP; local stdio | OAuth (remote, one-click) or PAT (`Authorization: Bearer`, `GITHUB_PERSONAL_ACCESS_TOKEN`) | Not stated in README | `X-MCP-Readonly: true` header or `/readonly` URL suffix (remote). `--read-only` / `GITHUB_READ_ONLY=1` (local). Toolsets via `X-MCP-Toolsets` / `--toolsets` |
| Jira (Atlassian) | Yes (atlassian/atlassian-mcp-server, "Rovo MCP") | `https://mcp.atlassian.com/v2/mcp` (recommended). v1 `/v1/mcp` still supported. `/v1/sse` ended after 30 Jun 2026 | Remote HTTP | OAuth 2.1, or API token (Basic email:token / Bearer service key; admin must enable) | "Generally Available" badge | No client flag. Admin-level permission groups (`read_jira`, `write_jira`, ...) plus scoped API tokens |
| Linear | Yes (hosted) | `https://mcp.linear.app/mcp` (used in Anthropic's official Linear plugin) | Remote HTTP | OAuth (DCR). Bearer API key **UNVERIFIED** | Not verified | `/mcp/readonly` path and read-only API key **UNVERIFIED (search snippet only)** |
| Google Calendar | Yes (Google-managed remote MCP) | `https://calendarmcp.googleapis.com/mcp/v1` (live-probed) | Remote streamable HTTP (stateless) | OAuth 2.0 (GCP project, enable `calendarmcp.googleapis.com`) **docs UNVERIFIED** | "Developer Preview" **UNVERIFIED** | Tools carry `readOnlyHint`. No server flag found. Use client-side allowlist + read-only OAuth scope |
| Slack | Yes (Slack-hosted) | `https://mcp.slack.com/mcp` | Remote HTTP | OAuth (user token). Anthropic/Slack plugin ships `clientId 1601185624273.8899143856786`, `callbackPort 3118` | Not verified | OAuth scopes only (per search snippets). Workspace admin must approve MCP |
| Outlook calendar (M365) | Yes, two routes: (a) Agent 365 `mcp_CalendarTools`, (b) Work IQ | (a) `https://agent365.svc.cloud.microsoft/agents/tenants/{tenant_id}/servers/mcp_CalendarTools`; (b) `https://workiq.svc.cloud.microsoft/mcp` or `npx -y @microsoft/workiq mcp` | (a) remote HTTP; (b) remote HTTP or local stdio | Entra ID OAuth with tenant admin consent. Work IQ needs an M365 Copilot license per user | Work IQ: "Public Preview" | None found. Agent 365 scope is `McpServers.Calendar.All`. Must allowlist read tools client-side |
| Microsoft Teams | Yes, same two routes: Agent 365 `mcp_TeamsServer`, Work IQ | `.../servers/mcp_TeamsServer`; Work IQ as above | Remote HTTP / stdio | Same as above (scope `McpServers.Teams.All`) | Preview (Work IQ). Agent 365 status not verified | None found. Client-side allowlist |
| (MS Entra, FYI) | Microsoft MCP Server for Enterprise | `https://mcp.svc.cloud.microsoft/enterprise` | Remote HTTP | Entra, `MCP.*` scopes | Public Preview | Read-only by design, but it covers Entra only, not mail, calendar, or Teams |

#### GitHub

Sources: [github/github-mcp-server README](https://github.com/github/github-mcp-server) (WebFetch + clone, last commit 2026-10-22), [docs/server-configuration.md](https://github.com/github/github-mcp-server/blob/main/docs/server-configuration.md), [docs/remote-server.md](https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md).

- **Remote:** `https://api.githubcopilot.com/mcp/`. The README says GitHub Enterprise Server "does not support remote server hosting".
- **Local:** Docker `ghcr.io/github/github-mcp-server`, or the binary `github-mcp-server stdio`.
- **Quick-reference table** in server-configuration.md, quoted:
  - "Read-Only Mode | `X-MCP-Readonly` header or `/readonly` URL | `--read-only` flag or `GITHUB_READ_ONLY` env var"
  - "Toolsets | `X-MCP-Toolsets` header or `/x/{toolset}` URL | `--toolsets` flag or `GITHUB_TOOLSETS` env var"
  - "Individual Tools | `X-MCP-Tools` header | `--tools` flag or `GITHUB_TOOLS` env var"
  - "Exclude Tools | `X-MCP-Exclude-Tools` header | `--exclude-tools` flag or `GITHUB_EXCLUDE_TOOLS` env var"
  - "Lockdown Mode | `X-MCP-Lockdown` header | `--lockdown-mode` flag or `GITHUB_LOCKDOWN_MODE` env var"
- **Read-only precedence:** "**read-only** mode acts as a strict security filter that takes precedence over any other configuration, by disabling write tools even when explicitly requested."
- **Default toolsets:** "`context`, `issues`, `pull_requests`, `repos`, `users`".
- **Remote read-only example** from server-configuration.md:
  ```json
  { "type": "http", "url": "https://api.githubcopilot.com/mcp/",
    "headers": { "X-MCP-Toolsets": "issues,repos,pull_requests", "X-MCP-Readonly": "true" } }
  ```
  The same thing works as a URL path: `https://api.githubcopilot.com/mcp/x/all/readonly`.
- **Lockdown is not an authorization boundary.** README: it "is **not** an authorization boundary: it does not change what the underlying GitHub credential can read or write".
- **Tool names**, classified by `annotations.readOnlyHint` in `pkg/github/__toolsnaps__/*.snap` (141 snapshots):
  - **Read (readOnlyHint true):** `actions_get actions_list get_commit get_file_contents get_file_blame get_job_logs get_label get_latest_release get_me get_release_by_tag get_repository_tree get_tag get_team_members get_teams issue_read list_branches list_commits list_issue_fields list_issue_types list_issues list_label list_notifications list_pull_requests list_releases list_repository_collaborators list_tags projects_get projects_list pull_request_read search_code search_commits search_issues search_orgs search_pull_requests search_repositories search_users get_discussion list_discussions get_dependabot_alert list_dependabot_alerts get_code_scanning_alert list_code_scanning_alerts` (and more).
  - **Write:** `actions_run_trigger add_issue_comment add_comment_to_pending_review add_reply_to_pull_request_comment create_branch create_or_update_file create_pull_request create_repository delete_file fork_repository issue_write merge_pull_request pull_request_review_write push_files request_copilot_review resolve_review_thread sub_issue_write update_issue_comment update_pull_request update_pull_request_branch label_write projects_write star_repository dismiss_notification` (and more).
  - This session's GitHub connector exposes the same names, for example `mcp__github__issue_read` and `mcp__github__pull_request_read` (observed in session).
- **Status:** the README states no GA or preview label.

#### Jira (Atlassian Rovo MCP)

Sources: [atlassian/atlassian-mcp-server README](https://github.com/atlassian/atlassian-mcp-server) (clone, last commit 2026-10-08), [.mcp.json](https://github.com/atlassian/atlassian-mcp-server/blob/main/.mcp.json), [skills/README.md](https://github.com/atlassian/atlassian-mcp-server/blob/main/skills/README.md).

- **Status:** the README badge reads "Status: Generally Available".
- **Endpoint:** "**v2 is now the recommended version.** New setups should use `https://mcp.atlassian.com/v2/mcp`".
  - "The v1 endpoints (`https://mcp.atlassian.com/v1/mcp/authv2` and `https://mcp.atlassian.com/v1/mcp`) remain supported".
  - "**After 30 June 2026, the legacy Server-Sent Events endpoint (`https://mcp.atlassian.com/v1/sse`) will no longer be supported.**"
- **Official `.mcp.json`:** `{"mcpServers":{"atlassian":{"type":"http","url":"https://mcp.atlassian.com/v2/mcp"}}}`. The anthropics engineering plugin still points at `/v1/mcp`.
- **Auth:** OAuth 2.1, or API token.
  - Token headers: "Personal API token (Basic auth) | `Authorization: Basic <base64(email:api_token)>`" and "Service account API key (Bearer token) | `Authorization: Bearer <api_key>`".
  - Admin requirement: "**Admin enablement required:** An organization admin must enable API token authentication for the Atlassian MCP Server (**Atlassian Administration → Rovo → Rovo MCP server → Authentication**)."
- **Read-only control** is admin and permission-group based. There is no client flag.
  - Permission groups: "Jira | `read_jira` · `write_jira` · `search_jira`".
  - "Organization admins grant or revoke access at the permission-group level, and each tool inherits the access of its parent group."
  - "`delete_jira` and `manage_jira` are **disabled by default**".
  - For a token-based read-only path, create a scoped API token with read scopes only.
- **Tool exposure in v2:** "v2 exposes a small set of *primary* tools in the client's tool list; the rest are reached through the `discover` and `execute` meta-tools." For a flat list there is the "`tools=all` override": `https://mcp.atlassian.com/v2/mcp?tools=all`.
  - Plugin impact: hook and permission matchers must also cover the `execute` meta-tool, which can call write operations.
- **Tool names** (from official skills; the v2 renames come from skills/README.md):
  - **Read:** `getAccessibleAtlassianResources`, `searchJiraIssuesUsingJql`, `getJiraIssue`, `lookupJiraAccountId`, `listJiraProjects` (v1 `getVisibleJiraProjects`), `listJiraProjectIssueTypesMetadata` (v1 `getJiraProjectIssueTypesMetadata`), `getJiraIssueTypeMetaWithFields`, `getConfluenceContent`, `searchConfluence`, `getConfluenceSpace(s)`.
  - **Write:** `createJiraIssue`, `addOrEditJiraIssueComment` (v1 `addCommentToJiraIssue`), `createConfluenceContent`, `updateConfluenceContent`. The full list is on Atlassian's "Supported tools" page, which I could not open.
- **Admin requirements:** domain allowlist on the "Rovo MCP server" settings page, IP allowlisting, and an audit log entry for every tool call.

#### Linear

Sources: [anthropics/claude-plugins-official external_plugins/linear/.mcp.json](https://github.com/anthropics/claude-plugins-official/blob/main/external_plugins/linear/.mcp.json) (clone). I could not open `linear.app/docs/mcp` (blocked).

- **Endpoint:** `{"linear":{"type":"http","url":"https://mcp.linear.app/mcp"}}`, the same URL as in the knowledge-work engineering plugin.
- **UNVERIFIED (search snippet only):**
  - Bearer `Authorization` with a Linear API key is accepted.
  - A `/mcp/readonly` variant exists.
  - `/sse` is deprecated.
- **Tool names observed in session** (this session's Linear connector; that it is the same server is likely but unconfirmed):
  - **Read:** `list_issues get_issue list_comments list_cycles list_projects get_project list_teams get_team list_users get_user list_documents get_document list_issue_statuses get_issue_status list_issue_labels list_project_labels list_milestones get_milestone get_status_updates list_custom_views get_workspace get_notifications get_attachment search_documentation extract_images`.
  - **Write:** `save_issue save_comment save_project save_document save_milestone save_status_update save_issue_label save_project_label create_issue_label create_attachment delete_comment delete_attachment delete_status_update mark_notification share_issue unshare_issue retire_issue_label`.
  - Naming convention: write tools use `save_*`, `create_*`, `delete_*`, `share_*`, `retire_*`, `restore_*`, `merge_*`, `submit_*`, `update_*`, `resolve_*`, and `mark_*`.

#### Google Calendar

- **Live probe (2026-10-23):** `POST https://calendarmcp.googleapis.com/mcp/v1` with `initialize` returned `{"protocolVersion":"2025-06-18","serverInfo":{"name":"StatelessServer","version":"ESF"}}`. An unauthenticated `tools/list` returned 9 tools with annotations:
  - **readOnlyHint true:** `list_calendars`, `list_events`, `get_event`, `search_events`, `suggest_time`.
  - **readOnlyHint false:** `create_event`, `update_event`, `respond_to_event`, `delete_event` (`destructiveHint` true).
  - This session's Google_Calendar connector exposes the same 9 names (observed in session).
- [google/mcp README](https://github.com/google/mcp) (clone, last commit 2026-08-17): "These remote MCP servers are managed by Google ... and are available via endpoint". The README's Workspace entry points to the Gemini CLI extension, a different, local product.
- **UNVERIFIED (search snippet only):**
  - Google's page "Configure the Calendar MCP server" at developers.google.com says to enable `calendar-json.googleapis.com` and `calendarmcp.googleapis.com` in a GCP project.
  - It uses OAuth 2.0 and needs an OAuth consent screen.
  - The "Developer Preview" label comes from a third-party listing.
- **Read-only:** the server documents no read-only flag. Rely on (a) a client-side allowlist of the 5 read tools, and (b) requesting only `calendar.readonly` / `calendar.events.readonly` OAuth scopes. Scope support for (b) is UNVERIFIED.
- **Related local server:** [gemini-cli-extensions/workspace docs/feature-configuration.md](https://github.com/gemini-cli-extensions/workspace/blob/main/docs/feature-configuration.md) has a feature toggle per service:
  - `calendar.read` covers `calendar.list`, `calendar.listEvents`, `calendar.getEvent`, `calendar.findFreeTime`.
  - `calendar.write` covers `calendar.createEvent`, `calendar.updateEvent`, `calendar.respondToEvent`, `calendar.deleteEvent`.
  - Toggles are set with `WORKSPACE_FEATURE_OVERRIDES`, for example `"gmail.write:off,calendar.deleteEvent:off"`.
  - This is a Google-org Gemini CLI extension, not the remote server.
- **Export fallback:** the Google Calendar "Secret address in iCal format" and Google Takeout `.ics` both exist, but neither was verified on a vendor page this session.

#### Slack

Sources: [slackapi/slack-mcp-plugin](https://github.com/slackapi/slack-mcp-plugin) (clone, last commit 2026-10-19; official Slack org; a Claude Code / Cursor / Codex plugin).

- **`.mcp.json`:** `{"mcpServers":{"slack":{"type":"http","url":"https://mcp.slack.com/mcp","oauth":{"clientId":"1601185624273.8899143856786","callbackPort":3118}}}}`.
- **Admin:** README: "**Workspace admin approval.** Your Slack workspace admin must approve MCP integration before you can authenticate."
- **Tool names** from the plugin skills:
  - **Read:** `slack_search_public`, `slack_search_public_and_private`, `slack_search_channels`, `slack_search_users`, `slack_read_channel`, `slack_read_thread`, `slack_read_user_profile`, `slack_read_file`, `slack_list_channel_members`, `slack_get_reactions`.
  - **Write:** `slack_send_message`, `slack_send_message_draft`, `slack_schedule_message`, `slack_create_canvas`, `slack_add_reaction`. The README also mentions canvas update.
- **UNVERIFIED (search snippet only):** read-only behaviour depends on the OAuth scopes granted (`search:read.*`, `channels:history`, ...; `chat:write` for sending). Slack's docs page `https://docs.slack.dev/ai/mcp-server/` could not be opened.
- **Read-only mechanism for em-tools:** a client-side allowlist and deny/hook on `slack_send_*`, `slack_schedule_message`, `slack_create_canvas`, `slack_add_reaction`, and any canvas update tool.

#### Microsoft Outlook calendar and Teams (M365)

Sources: [microsoft/mcp README](https://github.com/microsoft/mcp) (clone, last commit 2026-10-23), [microsoft/work-iq](https://github.com/microsoft/work-iq) (clone, last commit 2026-10-19; README, PLUGINS.md, ADMIN-INSTRUCTIONS.md, plugins/workiq/.mcp.json), [microsoft/EnterpriseMCP](https://github.com/microsoft/EnterpriseMCP) (clone), [microsoft/Agent365-Samples python/claude/sample-agent/ToolingManifest.json](https://github.com/microsoft/Agent365-Samples/blob/main/python/claude/sample-agent/ToolingManifest.json) (clone).

**Agent 365 tooling servers**, listed in microsoft/mcp:

- "Microsoft 365 Calendar ... Calendar tools for creating, updating, deleting events, managing invites, and checking availability ... TYPE: `REMOTE` - `https://agent365.svc.cloud.microsoft/agents/tenants/{tenant_id}/servers/mcp_CalendarTools`".
- "Microsoft Teams ... Manage Microsoft Teams chats, channels, users, and messages via Graph API ... `https://agent365.svc.cloud.microsoft/agents/tenants/{tenant_id}/servers/mcp_TeamsServer`".
- Also `mcp_MailTools`, `mcp_MeServer`, `mcp_M365Copilot`, and others.
- Scopes from the sample ToolingManifest: `McpServers.Calendar.All`, `McpServers.Teams.All`, `McpServers.Mail.All`, with audience `ea9ffc3e-8a23-4a7d-836d-234d7c7565c1`. No read-only scope variant is shown.
- Per-tool names are not documented in any source I could open.

**Work IQ** (microsoft/work-iq):

- **Status:** "⚠️ **Public Preview:** Features and APIs may change."
- **Local stdio:** `npx -y @microsoft/workiq mcp` (npm `@microsoft/workiq`; server.json `"transport": {"type": "stdio"}`, version 0.2.8).
- **Hosted:** plugins/workiq/.mcp.json is `{"type":"http","url":"https://workiq.svc.cloud.microsoft/mcp","oauthClientId":"ba081686-5d24-4bc6-a0d6-d034ecffed87","oauthPublicClient":true,"auth":{"redirectPort":12798}}`. These are Copilot-CLI-style keys, not Claude Code's `oauth.clientId`.
- **Tools** (PLUGINS.md):
  - **Read:** `ask_work_iq`, `fetch_work_iq`, `fetch_blob_work_iq`, `get_schema_work_iq`, `search_paths_work_iq`.
  - **Write:** `create_entity_work_iq`, `update_entity_work_iq`, `delete_entity_work_iq`, `do_action_work_iq`, `call_function_work_iq`.
  - Other: `get_debug_link`.
- **Admin:** "To access Microsoft 365 tenant data, the WorkIQ CLI and MCP Server need to be consented to permissions that require administrative rights on the tenant."
- **Licensing** (ADMIN-INSTRUCTIONS.md): "**Microsoft 365 Copilot license** for each user who will use Work IQ".
- **Delegated permissions** (all required): `Sites.Read.All`, `Mail.Read`, `People.Read.All`, `OnlineMeetingTranscript.Read.All`, `Chat.Read`, `ChannelMessage.Read.All`, `ExternalItem.Read.All`.
- **Consent roles:** Privileged Role Administrator, Cloud Application Administrator, or Application Administrator.

**Microsoft MCP Server for Enterprise** (EnterpriseMCP README):

- "public preview", `https://mcp.svc.cloud.microsoft/enterprise`.
- Tools: `microsoft_graph_suggest_queries`, `microsoft_graph_get` ("Executes read-only Microsoft Graph API calls"), `microsoft_graph_list_properties`.
- Coverage is Entra only: "M365 APIs will be covered by **Agent 365**". This is not useful for calendar or Teams.

**Read-only mechanism for em-tools:** none server-side. Allowlist the Work IQ read tools and deny `*_entity_work_iq`, `do_action_work_iq`, `call_function_work_iq`. A team without an M365 Copilot license or admin consent needs the export path.

**Export fallback** (not verified on a vendor page this session): Outlook "Publish calendar" ICS link or a `.ics` export; Teams has no general user CSV export. A Graph API app (`Calendars.Read`, `ChannelMessage.Read.All`) is the non-MCP route.

---

### 4b. Claude Code plugin docs

Sources opened (the markdown form of each, fetched 2026-10-23):

- [plugins-reference](https://code.claude.com/docs/en/plugins-reference) (titled "Plugin manifest reference")
- [plugins](https://code.claude.com/docs/en/plugins.md)
- [plugins/components](https://code.claude.com/docs/en/plugins/components.md)
- [plugins/create](https://code.claude.com/docs/en/plugins/create.md)
- [plugins/loading](https://code.claude.com/docs/en/plugins/loading.md)
- [plugins/cli-reference](https://code.claude.com/docs/en/plugins/cli-reference.md)
- [plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces.md)
- [hooks](https://code.claude.com/docs/en/hooks.md)
- [mcp](https://code.claude.com/docs/en/mcp.md)
- [skills](https://code.claude.com/docs/en/skills.md)
- [permissions](https://code.claude.com/docs/en/permissions.md)
- [settings](https://code.claude.com/docs/en/settings.md)

#### plugin.json

- **Location:** "Save the manifest at `.claude-plugin/plugin.json` under the plugin root. Put every other plugin file at the plugin root, not inside `.claude-plugin/`."
- **The manifest is optional:** "The manifest is optional. Without it, Claude Code loads the components it finds in the standard layout."
- **Required fields:** "`name` is the only required key." `author` is an object with "`name`, which is required, plus optional `email` and `url`".
- **Other keys:** `displayName version description author homepage repository license keywords metadata defaultEnabled dependencies settings userConfig channels skills commands agents hooks mcpServers lspServers outputStyles workflows experimental`.
- **Unknown keys:** "An unrecognized top-level key is stripped". Unknown keys inside a `userConfig` option are an error.
- **Reserved names:** names starting with `claude-` or `anthropic-` are errors. A whole-word `claude` elsewhere is a warning. Our name `em-tools` is fine.

#### userConfig

- **Option fields:**
  - "`type` | Yes | One of `string`, `number`, `boolean`, `directory`, or `file`"
  - "`title` | Yes"
  - "`description` | Yes"
  - "`required` | No | If `true`, the configuration dialog doesn't accept an empty value"
  - "`default`", "`options`" (v2.1.271+), "`multiple`"
  - "`sensitive` | No | If `true`, masks input and stores the value in secure storage instead of `settings.json`"
  - "`min` / `max`"
- **Keys:** "Keys are identifiers made of letters, digits, and underscores, and can't start with a digit."
- **Storage:** "Non-sensitive values are saved under `pluginConfigs` in the user's `settings.json`. Sensitive values go to the platform's secure credential store instead."
- **How values reach components:**
  - "**`${user_config.KEY}`**: substituted in MCP server config, LSP server config, exec-form hook `args`, and skill and agent content. In skill and agent content, only non-sensitive values are substituted, and a sensitive value there becomes a placeholder"
  - "**`CLAUDE_PLUGIN_OPTION_<KEY>`**: exported to hook processes for every option, with `<KEY>` uppercased. A shell-form hook reads `$CLAUDE_PLUGIN_OPTION_API_TOKEN` for `api_token`"
- **Where `${...}` resolves for MCP servers:**
  - "MCP `stdio` servers | `command`, `args`, `env` | `CLAUDE_PLUGIN_ROOT`, `CLAUDE_PLUGIN_DATA`"
  - "MCP `http`, `sse`, `ws` servers | `url`, `headers`, `headersHelper`"
  - So a token is passed as `"env": {"LINEAR_API_KEY": "${user_config.linear_token}"}` or as `"headers": {"Authorization": "Bearer ${user_config.github_pat}"}`.
- **Shell-form limitation:** "Shell-form hook commands, monitor commands, and MCP `headersHelper` reject `${user_config.*}`."
- **Validator checks:** `claude plugin validate` reports "a `${user_config.KEY}` reference to an option the manifest doesn't declare" as an error. It warns on "a header value that looks like a literal credential" (v2.1.281+).

#### ${CLAUDE_PLUGIN_ROOT} / ${CLAUDE_PLUGIN_DATA}

- "`${CLAUDE_PLUGIN_ROOT}` | Absolute path of the plugin's installed version". Also: "`${CLAUDE_PLUGIN_ROOT}` changes when the plugin updates, so don't write state there."
- "`${CLAUDE_PLUGIN_DATA}` | `~/.claude/plugins/data/<id>/`, created on first reference and kept across plugin updates."
- **Uninstall wipes it:** "By default, Claude Code deletes the `${CLAUDE_PLUGIN_DATA}` directory when you uninstall the plugin from the last place it's installed."
- From cli-reference: "When you uninstall a plugin from the last scope it's installed at, Claude Code also deletes the plugin's stored options and secrets and its data directory". The flag "`--keep-data` | Preserve the plugin's persistent data directory".
- **Answer:** DATA is kept on update and deleted on (last-scope) uninstall unless `--keep-data` is passed.
- **Not visible to Bash:** "The variables aren't present in the environment of commands Claude runs through the Bash tool". In skills, write `${CLAUDE_PLUGIN_ROOT}` in the Markdown body so it is substituted inline.

#### Plugin settings.json: no permission deny rules

- From components: "A `settings.json` at the plugin root holds settings that apply while the plugin is enabled ... Only two keys take effect from a plugin, `agent` and `subagentStatusLine`; every other key is dropped."
- **Consequence:** a plugin cannot ship `permissions.deny`. Enforce read-only with (a) PreToolUse hooks in the plugin, (b) skill `allowed-tools` / `disallowed-tools`, and (c) documented deny rules that the user or admin adds to their own or managed settings.
- **Permission rule order:** "Rules are evaluated in order: deny, then ask, then allow."
- **MCP rule syntax:** "To match every tool from an MCP server, write `mcp__<server>__*`". For plugin servers: "write `mcp__plugin_my-plugin_database-tools__*`".

#### Hooks (PreToolUse blocking)

- **File format:** `hooks/hooks.json` must wrap the event map: "A hooks file wraps the event map in a top-level `"hooks"` key ... A file that contains only the event map, without that wrapper, fails to load."
- **Exit code 2:** "Exit with code 2 to block the action ... a `PreToolUse` hook blocks the tool call". "The message that comes with the block is your hook's stderr."
  - "Exit 2 blocks even when your hook prints JSON ... Even a `permissionDecision` of `"allow"` doesn't let the action through."
- **JSON deny** (exit 0):
  ```json
  { "hookSpecificOutput": { "hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "Database writes are not allowed" } }
  ```
  `permissionDecision` takes "(allow/deny/ask/defer)". "`"deny"` prevents the tool call." The reason "For `"deny"`, shown to Claude."
- **Deprecated fields:** "PreToolUse previously used top-level `decision` and `reason` fields, but these are deprecated for this event."
- **Other exit codes:** an exit code other than 0 or 2 is non-blocking by default ("Exit code other than 0 or 2 ... To return a JSON decision, exit 0").
- **Matcher syntax:**
  - "Only letters, digits, `_`, `-`, spaces, `,`, and `|` | Exact string ..."
  - "Contains any other character | JavaScript regular expression, unanchored"
  - "To match every tool from a server, append `.*` to the server prefix. The `.*` is required".
- **Plugin MCP tools:** "Tools from a plugin-bundled MCP server use a scoped server segment that includes the plugin name: `mcp__plugin_<plugin-name>_<server-name>__<tool>`. A matcher written against the bare server key never fires for these tools. For a plugin named `my-plugin` that bundles a server under the key `db` ... the matcher for every tool from that server is `mcp__plugin_my-plugin_db__.*`."
- **Hook input** includes `tool_name`, `tool_input`, and (v2.1.274+) `mcp_server` with `name` and `source`.
- **Hook environment:** "every hook process receives `CLAUDE_PLUGIN_ROOT` and `CLAUDE_PLUGIN_DATA` in its environment, plus `CLAUDE_PLUGIN_OPTION_<KEY>`".
- **When hooks fire:** "A plugin's hooks don't wait for one of the plugin's skills or commands to be used." They fire for every session once the plugin loads.

#### MCP tool naming for plugin servers

- From the mcp doc: "The full form is `mcp__plugin_<plugin-name>_<server-name>__<tool-name>`, where any character outside `A-Z`, `a-z`, `0-9`, `_`, and `-` is replaced with `_`."
  - Example: `mcp__plugin_my-plugin_database-tools__query`.
  - "Use this full name when referencing the tool in permission rules, a skill's `allowed-tools` list, a subagent's `tools` field, or a hook matcher."
- **Server name in `/mcp`:** `plugin:<plugin>:<server>`.
- **Length limit:** a tool is dropped if its full name is over 128 characters.
- **For em-tools:** GitHub through a plugin server keyed `github` becomes `mcp__plugin_em-tools_github__issue_read`.

#### `claude plugin validate --strict`

- "`--strict` | Treat warnings as errors, so unrecognized fields and missing metadata that the runtime tolerates fail the run".
- Exit codes: "`0` | `Validation passed` or `Validation passed with warnings`" and "`1` | `Validation failed` or `Validation failed (--strict treats warnings as errors)`".
- **Warnings include:** a non-kebab-case `name` and a missing `version`, `description`, or `author`. A root `CLAUDE.md` also draws a warning: "A `CLAUDE.md` at the plugin root isn't loaded as context, and `claude plugin validate` warns when it finds one". Another: an unquoted `${CLAUDE_PLUGIN_ROOT}` in a shell-form hook.
- **MCP checks** (v2.1.281+) report dropped entries and invalid URLs as errors. They report `http://` URLs to non-loopback hosts and literal credentials in headers as warnings.

#### Local install

- **One session:** `claude --plugin-dir ./my-plugin`. "Load a plugin from a directory or a `.zip` archive of one ... Each flag takes one path". It shows as `<name>@inline`.
  - "If you point it at a marketplace root instead, Claude Code doesn't read `marketplace.json`".
- **Local marketplace:** `my-marketplace/.claude-plugin/marketplace.json`. "The file requires a `name`, an `owner`, and a `plugins` array. Each object in `plugins` is a plugin entry and needs a `name` and a `source`."
  ```json
  { "name": "my-marketplace", "owner": { "name": "Your Name" },
    "plugins": [ { "name": "my-first-plugin", "source": "./plugins/my-first-plugin", "description": "..." } ] }
  ```
  Then run:
  - `claude plugin validate ./my-marketplace`
  - `claude plugin marketplace add ./my-marketplace`
  - `claude plugin install my-first-plugin@my-marketplace`
  - `claude plugin list`

#### bin/

- "Files in `bin/` at the plugin root are on the `PATH` of the Bash tool's shell while the plugin is enabled, so Claude can run them as bare commands."
- "Plugin `bin/` directories come after the user's own `PATH` entries, so a plugin can't shadow `git`, `ls`, or another system command."
- **Distribution limit:** "claude.ai and Cowork don't install a plugin that has a top-level `bin/` directory". Put em-tools' own server under `server/` or `scripts/`, not `bin/`, if claude.ai/Cowork distribution matters.

#### SKILL.md frontmatter (skills doc)

| Field | What the doc says |
|---|---|
| `name` | "No | Command name shown in the `/` menu. Defaults to the directory name." |
| `description` | "Recommended ... the combined `description` and `when_to_use` text is truncated at 1,536 characters" |
| `when_to_use` | Extra trigger context |
| `argument-hint` | Autocomplete hint for arguments |
| `arguments` | Named positional arguments |
| `disable-model-invocation` | Prevents Claude from loading the skill automatically |
| `user-invocable` | Set to `false` to hide the skill from the `/` menu |
| `allowed-tools` | "Tools Claude can use without asking permission during the turn that invokes this skill. The grant clears when you send your next message. Accepts a space- or comma-separated string, or a YAML list." |
| `disallowed-tools` | "Tools removed from Claude's available pool while this skill is active." |
| `model` | Model override for the skill |
| `effort` | Effort level override |
| `context` | `fork` runs the skill in a forked subagent |
| `agent` | Subagent type for `context: fork` |
| `background` | Wait or not for the forked subagent |
| `hooks` | Hooks registered when the skill runs |
| `paths` | Glob patterns that limit activation |
| `shell` | `bash` (default) or `powershell` |
| `metadata` | Free-form map |
| `license` | Accepted, not acted on |
| `compatibility` | Accepted, not acted on |

Plugin skills are namespaced, for example `/my-plugin:hello`.

#### Reference: anthropics/knowledge-work-plugins `engineering`

Source: [anthropics/knowledge-work-plugins/engineering](https://github.com/anthropics/knowledge-work-plugins/tree/main/engineering) (clone, last commit 2026-10-21).

**Layout:**

```
engineering/
  .claude-plugin/plugin.json
  .mcp.json
  CONNECTORS.md
  README.md
  skills/{architecture,code-review,debug,deploy-checklist,documentation,incident-response,standup,system-design,tech-debt,testing-strategy}/SKILL.md
```

There are no hooks, no bin/, and no settings.json.

**plugin.json** (the description's em-dash is replaced with "-" here):

```json
{ "name": "engineering", "version": "1.2.0",
  "description": "Streamline engineering workflows - standups, code review, architecture decisions, incident response, and technical documentation. Works with your existing tools or standalone.",
  "author": { "name": "Anthropic" } }
```

**.mcp.json** (exact):

```json
{
  "mcpServers": {
    "slack": {
      "type": "http",
      "url": "https://mcp.slack.com/mcp",
      "oauth": {
        "clientId": "1601185624273.8899143856786",
        "callbackPort": 3118
      }
    },
    "linear": {
      "type": "http",
      "url": "https://mcp.linear.app/mcp"
    },
    "asana": {
      "type": "http",
      "url": "https://mcp.asana.com/v2/mcp"
    },
    "atlassian": {
      "type": "http",
      "url": "https://mcp.atlassian.com/v1/mcp"
    },
    "notion": {
      "type": "http",
      "url": "https://mcp.notion.com/mcp"
    },
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "pagerduty": {
      "type": "http",
      "url": "https://mcp.pagerduty.com/mcp"
    },
    "datadog": {
      "type": "http",
      "url": "https://mcp.datadoghq.com/api/unstable/mcp-server/mcp"
    },
    "google calendar": {
      "type": "http",
      "url": ""
    },
    "gmail": {
      "type": "http",
      "url": ""
    }
  }
}
```

Notes:

- Atlassian here is still `/v1/mcp`. Atlassian now recommends `/v2/mcp`.
- Google Calendar is an empty URL placeholder. The live endpoint is `https://calendarmcp.googleapis.com/mcp/v1`.

**CONNECTORS.md** (key lines):

- "Plugin files use `~~category` as a placeholder for whatever tool the user connects in that category."
- "Plugins are **tool-agnostic** ... The `.mcp.json` pre-configures specific MCP servers, but any MCP server in that category works."
- Table columns: `Category | Placeholder | Included servers | Other options`.
- Example row: "Chat | `~~chat` | Slack | Microsoft Teams".

**Skill frontmatter style:** `name`, `description`, `argument-hint` only.

---

# Part 5: Phase 2 data sources

Checked 2026-10-24 from search results; vendor pages were not opened directly from the sandbox, so confirm before relying on details.

- **PagerDuty:** official MCP server, hosted at mcp.pagerduty.com (EU variant exists) and as a local server. The local server exposes read-only tools by default and needs `--enable-write-tools` for writes; one source says the hosted server has no tool filtering. Tool counts differ between sources (roughly 50 to 55 read tools, 22 to 28 write tools). ([PagerDuty MCP docs: read vs write](https://www.mintlify.com/PagerDuty/pagerduty-mcp-server/tools/read-vs-write), [tools overview](https://www.mintlify.com/PagerDuty/pagerduty-mcp-server/tools/overview), [Scalekit comparison](https://www.scalekit.com/blog/pagerduty-mcp-vs-api))
- **incident.io:** official hosted MCP server at `https://mcp.incident.io/mcp`, Streamable HTTP, OAuth; the older open-source server is superseded. Capabilities include declaring and triaging incidents, acknowledging pages, on-call schedules and follow-ups, so write tools exist. ([incident.io blog](https://incident.io/blog/we-built-an-mcp-server-so-claude-can-access-your-incidents), [mcpservers.org listing](https://mcpservers.org/remote-mcp-servers/incident-io))
- **Ashby:** official MCP server in open beta on all plans, respecting the user's Ashby permissions. ([Ashby product update](https://www.ashbyhq.com/product-updates/mcp))
- **Greenhouse:** an official MCP server in open beta is reported by third parties only (36 tools, admin-set scopes). UNVERIFIED. ([Hirevire](https://hirevire.com/articles/greenhouse-mcp))
- **Lever:** no official MCP server found; community servers only. ([AI Agent Index](https://theaiagentindex.com/compare/greenhouse-vs-lever))
- **Opsgenie:** end of support 5 April 2027; REST APIs stop and unmigrated data is deleted; features move to Jira Service Management and Compass. No MCP server found. ([Hyperping](https://hyperping.com/blog/opsgenie-end-of-life), [Atlassian Opsgenie pricing](https://www.atlassian.com/software/opsgenie/pricing))

---

# Part 6: Phase 3 data sources

Checked 2026-10-24 from search results; vendor pages were not opened directly from the sandbox, so confirm before relying on details. The jobs themselves are researched in Part 1 (sections 3, 8, 9, 10) and Part 2 (sections 2, 8, 9, 11).

- **Out-of-office in Google Calendar:** the Calendar API has an `outOfOffice` event type; `events.list` takes an `eventTypes` filter, and callers should check each returned event's `eventType`. Out-of-office events cannot be all-day events. ([Google: calendar status events](https://developers.google.com/calendar/api/guides/calendar-status))
- **Out-of-office in Outlook:** events carry a show-as status of free, tentative, busy or out of office (`oof`); the `getSchedule` action returns free/busy per user with the least-privileged `Calendars.ReadBasic` permission. Secondary sources only. ([Microsoft Learn: free/busy](https://learn.microsoft.com/fi-fi/graph/outlook-get-free-busy-schedule), [Icewolf](https://blog.icewolf.ch/archive/2022/06/06/calendar-availability-freebusy-requests-with-microsoft-graph/))
- **Jira sprints through Rovo MCP:** a third-party post reports new board and sprint tools, including `listJiraBoardSprints` and `getJiraBoardSprintData` (reads) and `manageJiraSprint` (creates, starts, updates and closes sprints, so a write). Not confirmed on Atlassian's supported-tools page. UNVERIFIED. ([jimiwikman.se](https://jimiwikman.se/atlassian/atlassian-resources/atlassian-app-updates/new-jira-tools-in-the-atlassian-rovo-mcp-server-r1292/), [Atlassian supported tools](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/supported-tools/))
- **Linear cycles:** Linear's MCP server exposes `list_cycles` (observed in a live tool list on 2026-10-24).
- **Code hotspots:** Adam Tornhill's behavioural code analysis treats files that change often and are complex as the costliest debt; churn comes from version control (`git log`), complexity from a proxy such as size. Code Maat computes this from `git log` output; temporal coupling (files that change together) comes from the same data. Mostly secondary sources. ([InfoQ](https://www.infoq.com/news/2017/04/tornhill-prioritise-tech-debt), [Maintainable podcast](https://maintainable.fm/episodes/adam-tornhill-prioritizing-technical-debt-with-behavioral-code-analysis), [Boyter](https://boyter.org/posts/sloc-cloc-code-hotspots-finding-files-that-need-attention/))
- **Team pulse surveys:** no new connector. The EM runs the check-in in the survey tool their organisation already uses and exports responses with no names; em-tools only aggregates the export.
