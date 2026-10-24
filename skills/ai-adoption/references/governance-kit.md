# Team AI governance kit (templates)

Region-neutral templates for a team to adapt. They do not name any law or regulator. Your legal, security and privacy teams must add the rules that apply where you operate. Mark every `<fill in>` before adopting.

## 1. Team AI usage policy (draft for team discussion)

**Purpose.** We use AI coding tools to help us build good software faster, while protecting customer data, our code and each other.

**Owner and review.** Owner: <name or role>. Reviewed every 6 months, or when a new tool is added.

**Scope.** All code, docs, tickets and data handled by <team>, in any tool listed in the approved tools register.

**Our stance.**
- Use of AI tools is encouraged and optional. Nobody is judged on how much they use them.
- The author of a change is accountable for it, whoever or whatever wrote it.
- Measurement is team-level only, with groups of at least 4. It is never used in individual reviews.

**Data rules.**

| Data class | Examples | Allowed in |
|---|---|---|
| Public | Open-source code, public docs | Any approved tool |
| Internal | Our source code, internal docs, tickets | Approved tools on an organisation plan with training on our data turned off |
| Restricted | Customer personal data, credentials, keys, secrets, payment data, <fill in> | Never |

**Code rules.**
- AI-assisted changes go through the same review as any change.
- Extra human review for authentication, authorisation, cryptography, payments and <fill in>.
- Tests in the same change for any AI-assisted logic change.
- Label AI-assisted PRs where the tool supports it.

**Agent rules.** Tools that run commands, open PRs or call other systems:
- run with the least access they need, in a sandbox where possible;
- never get production credentials;
- never merge their own changes.

**Not allowed.** Unapproved tools for internal or restricted data; AI tools in CI or deploy pipelines without approval; pasting restricted data into any prompt.

**Questions and incidents.** Ask <fill in>. Report suspected data exposure to <fill in> straight away.

## 2. Approved tools register

| Tool | Plan or licence | Owner | Highest data class allowed | Surfaces (IDE, CLI, agent, CI) | Data retention and training settings | Admin and analytics access | Approved on | Next review |
|---|---|---|---|---|---|---|---|---|
| <tool> | <organisation or personal> | <role> | <Public or Internal> | <...> | <fill in from the vendor's terms> | <who can see usage data> | <date> | <date> |

## 3. Risk checklist

| Risk | Check | Done |
|---|---|---|
| Restricted data in prompts | Data rules shared; secret scanning on every commit; restricted repos excluded from tools | [ ] |
| Prompt injection | Agents treat issue text, PR comments, web pages and repo instruction files as untrusted; no auto-run of commands from them | [ ] |
| Agent permissions | Least privilege; no production credentials; human approval for writes outside the repo | [ ] |
| Hallucinated or look-alike packages | New dependencies reviewed; lockfiles pinned; registry allowlist where possible | [ ] |
| Licence of generated code | Ask your legal team for the policy on generated code and its licences; <fill in> | [ ] |
| Quality drift | Team-level PR size, review load, revert and change fail rates reviewed monthly | [ ] |
| Review overload | Review capacity planned; PR size agreement | [ ] |
| Audit trail | Tool logs or PR labels let you reconstruct what an agent changed | [ ] |
| Measurement misuse | Usage data seen at team level only, groups of 4 or more, never in individual reviews | [ ] |
| Vendor change | Register reviewed when terms, retention or pricing change | [ ] |
