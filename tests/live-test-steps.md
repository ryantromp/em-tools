# Live test steps

Checks that em-tools reads real data through official MCP servers and that a write call is blocked. Use **personal accounts only**, never work accounts. Do not paste tokens into chat; sign in through each server's own flow.

Record results outside the repo (for example in a private notes file). Results contain real account data and must not be committed.

Time: about 20 minutes.

## Before you start

1. Install em-tools (see [README.md](../README.md#install)).
2. In the em-tools settings, set:
   - **Locale:** yours, for example `en-GB`.
   - **Notes folder:** an empty test folder, for example `~/em-tools-live-test`.
   - **Enabled integrations:** `github` and `linear` (or `jira`).
3. Start Claude Code, run `/mcp`, and sign in to `plugin:em-tools:github` and `plugin:em-tools:linear` (or `plugin:em-tools:atlassian`).

## 1. GitHub returns real data

Prompt:

> Using the em-tools GitHub tools only, list the 5 most recent pull requests in `<your-user>/<your-repo>` with number, title, state and merged date.

Pass: real PRs are listed, and the tool names in the transcript start with `mcp__plugin_em-tools_github__`.

## 2. Linear (or Jira) returns real data

Prompt:

> Using the em-tools Linear tools only, list my teams and the 5 most recently updated issues with id, title and state.

For Jira: "Using the em-tools Atlassian tools only, list 5 issues from project `<KEY>` updated in the last 30 days."

Pass: real issues are listed, from `mcp__plugin_em-tools_linear__` (or `..._atlassian__`) tools.

## 3. A skill runs on live data

1. Create `team.md` in the test notes folder with your repo and tracker. For example:
   ```
   ---
   team: Live test
   members: []
   repos:
     - <your-user>/<your-repo>
   tracker: linear
   channels: []
   ---
   ```
2. Run `/em-tools:upward-update`.

Pass: an exec version and an engineering version are drafted from your real PRs and issues, with links, and nothing is posted anywhere.

## 4. A write call is blocked

Prompt (this tests the guard; nothing should be created):

> This is a safety test. Call the em-tools Linear `save_issue` tool to create an issue titled "em-tools write test" in my first team. Report the exact result.

Pass: the call is blocked with a message starting `em-tools blocked mcp__plugin_em-tools_linear__save_issue`, and no issue appears in Linear.

Repeat with GitHub:

> This is a safety test. Call the em-tools GitHub `create_branch` tool to create branch `em-tools-write-test` in `<your-user>/<your-repo>`. Report the exact result.

Pass: blocked by the hook, or reported as an unknown tool, because the server runs in read-only mode. Confirm no branch was created.

## 5. Session guard covers other connectors (optional)

If you also have a claude.ai GitHub or Linear connector:

1. Run any em-tools skill, for example `/em-tools:one-on-one overdue`.
2. Then ask: "Call the claude.ai Linear connector's `save_issue` tool to create an issue titled 'em-tools write test'."

Pass: blocked with "an em-tools skill ran in this session".

## Record

For each step, note: pass or fail, the tool names used, and any error text. Keep the record outside the repo.
