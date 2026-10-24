# Connectors

em-tools works with no connectors at all: every skill runs from pasted notes or exported CSV files. Connectors only add data, and they are always read-only.

Turn a source on in two places:

1. Sign in to its MCP server with the server's own sign-in (run `/mcp` in Claude Code, pick the server, and follow the browser flow). Never paste tokens into chat.
2. Add it to **Enabled integrations** in the em-tools plugin settings (`/config`, or the dialog shown at install).

The read-only guard blocks any call to a source that is not enabled.

## Sources

Checked on 2026-10-23. See [docs/research.md](docs/research.md#4a-official-vendor-mcp-servers) for sources.

| Source | Integration key | Official MCP server | Auth and admin needs | Status | Used by |
|---|---|---|---|---|---|
| GitHub | `github` | `https://api.githubcopilot.com/mcp/` with the `X-MCP-Readonly: true` header | OAuth sign-in. Works with personal accounts | Available | all skills except feedback-rehearsal |
| Jira | `jira` | Atlassian Rovo MCP `https://mcp.atlassian.com/v2/mcp?tools=all` | OAuth 2.1. A site admin may need to allow the Rovo MCP server and your domain | Generally available | one-on-one, review-packet, upward-update, team-delivery-health, dependency-register |
| Linear | `linear` | `https://mcp.linear.app/mcp` | OAuth sign-in | Available | one-on-one, review-packet, upward-update, team-delivery-health, dependency-register |
| Google Calendar | `google_calendar` | `https://calendarmcp.googleapis.com/mcp/v1` | OAuth through a Google Cloud project with the Calendar MCP API enabled. Requests the `calendar.readonly` scope | Preview (unverified) | one-on-one, team-delivery-health |
| Slack | `slack` | `https://mcp.slack.com/mcp` | OAuth. A workspace admin must approve MCP access | Available | upward-update, review-packet, dependency-register, postmortem-draft |
| Outlook calendar | `outlook` | Microsoft Work IQ (`npx -y @microsoft/workiq mcp`) | Entra ID sign-in with tenant admin consent, and a Microsoft 365 Copilot licence per user. Accept the Work IQ licence terms yourself in a terminal; em-tools blocks `accept_eula` | Public preview | one-on-one, team-delivery-health |
| Microsoft Teams | `teams` | Microsoft Work IQ (same server as Outlook) | Same as Outlook | Public preview | upward-update, review-packet, dependency-register, postmortem-draft |
| PagerDuty | `pagerduty` | Hosted `https://mcp.pagerduty.com/mcp` (EU: `https://mcp.eu.pagerduty.com/mcp`) | OAuth; some setups need a pre-registered OAuth client, or a user API key header. The old local server is deprecated | Available | oncall-health, postmortem-draft |
| incident.io | `incident_io` | Hosted `https://mcp.incident.io/mcp` | OAuth sign-in | Available; tool names not yet verified, so em-tools blocks all its tools for now | oncall-health, postmortem-draft (export until verified) |

### Gaps and fallbacks

Every v1 source has an official MCP server, but some are hard to reach for an individual EM. These fall back to exports:

| Gap | Fallback |
|---|---|
| Outlook and Teams need a paid Microsoft 365 Copilot licence and tenant admin consent | Outlook: export the calendar as ICS or CSV, or publish it and download the ICS. Teams: copy the channel messages you need into a text file |
| Slack needs workspace admin approval | Export the public channel (Slack workspace export) or copy the messages into a text file |
| Google Calendar needs a Google Cloud project and OAuth client; sign-in fails with "does not support dynamic client registration" without one | Use your existing claude.ai Google Calendar connector (em-tools blocks its write tools while a skill runs), or export ICS from Google Calendar settings |
| Jira sites can turn off Rovo MCP | Export issues to CSV from a Jira filter |
| incident.io tool names are unverified, so all its tools are blocked | Export alerts and the on-call schedule as CSV. Once you see the read tool names in `/mcp`, add them to `hooks/read-allowlist.json` |
| Opsgenie reaches end of support on 5 April 2027 and has no MCP server | Export alerts and schedules as CSV, or move to Jira Service Management |
| No integration supplies AI tool usage or spend | Export usage from the tool's admin console (GitHub Copilot usage metrics, Cursor admin API, Claude Code analytics) and paste spend from your invoices |
| Deployments are not in GitHub for some teams | Export a list of deploy dates, or tell the skill what counts as a deploy (for example merges to `main`) |

Expected export columns are listed in each metrics tool's description and in [fixtures/README.md](fixtures/README.md).

## How writes are blocked

A plugin cannot ship permission deny rules (only `agent` and `subagentStatusLine` take effect from a plugin's settings), so em-tools uses four layers:

1. **Server-side read-only mode** where the vendor offers one. GitHub's `X-MCP-Readonly: true` header disables every write tool on the server.
2. **Plugin hook, default deny** ([hooks/hooks.json](hooks/hooks.json), [hooks/guard.mjs](hooks/guard.mjs)). Before any call to an em-tools MCP server (`mcp__plugin_em-tools_*`), the hook checks the tool against the per-server allowlist in [hooks/read-allowlist.json](hooks/read-allowlist.json), and checks that the integration is enabled. Anything else is blocked with exit code 2, including tools a vendor adds later.
3. **Skill hooks.** Each skill registers the same guard in session mode. Once a skill has run, MCP tools on any other server whose names write, send or post are blocked for the rest of the session. This covers connectors you already had, such as claude.ai's GitHub or Slack.
4. **Your own deny rules (optional).** Add the block below to `~/.claude/settings.json` for a permanent block that does not depend on hooks.

```json
{
  "permissions": {
    "deny": [
      "mcp__plugin_em-tools_github__create_*", "mcp__plugin_em-tools_github__merge_*", "mcp__plugin_em-tools_github__push_*",
      "mcp__plugin_em-tools_linear__save_*", "mcp__plugin_em-tools_linear__create_*", "mcp__plugin_em-tools_linear__delete_*",
      "mcp__plugin_em-tools_atlassian__execute", "mcp__plugin_em-tools_atlassian__create*", "mcp__plugin_em-tools_atlassian__edit*",
      "mcp__plugin_em-tools_slack__slack_send_*", "mcp__plugin_em-tools_slack__slack_schedule_message", "mcp__plugin_em-tools_slack__slack_create_canvas",
      "mcp__plugin_em-tools_google-calendar__create_event", "mcp__plugin_em-tools_google-calendar__update_event", "mcp__plugin_em-tools_google-calendar__delete_event",
      "mcp__plugin_em-tools_workiq__accept_eula", "mcp__plugin_em-tools_workiq__*_entity_work_iq", "mcp__plugin_em-tools_workiq__do_action_work_iq",
      "mcp__plugin_em-tools_pagerduty__create_*", "mcp__plugin_em-tools_pagerduty__update_*", "mcp__plugin_em-tools_pagerduty__manage_*", "mcp__plugin_em-tools_pagerduty__add_*",
      "mcp__plugin_em-tools_incident-io__*"
    ]
  }
}
```

The hooks run only in Claude Code. In other agents that load these skills, connect each server in its own read-only mode where one exists, and use read-only tokens or scopes.

## Every write-capable tool and how it is blocked

Tool names as documented or observed on 2026-10-23. Vendors add tools; the default-deny hook blocks anything not on the read allowlist, so this table is for reference.

| Server | Write-capable tools | Blocked by |
|---|---|---|
| GitHub | `create_pull_request`, `update_pull_request`, `merge_pull_request`, `update_pull_request_branch`, `pull_request_review_write`, `add_comment_to_pending_review`, `add_reply_to_pull_request_comment`, `resolve_review_thread`, `request_copilot_review`, `issue_write`, `sub_issue_write`, `add_issue_comment`, `update_issue_comment`, `label_write`, `create_branch`, `create_or_update_file`, `delete_file`, `push_files`, `create_repository`, `fork_repository`, `star_repository`, `actions_run_trigger`, `projects_write`, `dismiss_notification` | Server read-only header (all), plugin hook (not on allowlist) |
| Jira (Atlassian Rovo) | `createJiraIssue`, `editJiraIssue`, `transitionJiraIssue`, `addOrEditJiraIssueComment` (v1 `addCommentToJiraIssue`), `createConfluenceContent`, `updateConfluenceContent`, the `execute` meta-tool, and any other non-read tool | Plugin hook |
| Linear | `save_issue`, `save_comment`, `save_project`, `save_document`, `save_milestone`, `save_status_update`, `save_issue_label`, `save_project_label`, `create_issue_label`, `create_attachment`, `delete_comment`, `delete_attachment`, `delete_status_update`, `mark_notification`, `share_issue`, `unshare_issue`, `retire_issue_label`, `restore_issue_label`, `merge_diff`, `submit_diff_review`, `update_diff` | Plugin hook |
| Google Calendar | `create_event`, `update_event`, `respond_to_event`, `delete_event` | Plugin hook, read-only OAuth scope |
| Slack | `slack_send_message`, `slack_send_message_draft`, `slack_schedule_message`, `slack_create_canvas`, `slack_add_reaction`, canvas updates | Plugin hook. `slack_search_public_and_private` is also blocked, because skills read public channels only |
| Microsoft Work IQ (Outlook, Teams) | `create_entity_work_iq`, `update_entity_work_iq`, `delete_entity_work_iq`, `do_action_work_iq`, `call_function_work_iq`, `accept_eula` | Plugin hook |
| PagerDuty | `create_incident`, `manage_incidents`, `add_responders`, `add_note_to_incident`, `start_incident_workflow`, `create_service`, `update_service`, `create_team`, `update_team`, `delete_team`, `add_team_member`, `remove_team_member`, `create_schedule`, `update_schedule`, `create_schedule_override`, `create_escalation_policy`, `update_escalation_policy`, `create_status_page_post`, `create_status_page_post_update`, `create_user`, alert grouping, orchestration and webhook writes. Per-person reads (`list_users`, `get_user_data`, `list_team_members`, `get_responder_metrics`, `get_responder_load_metrics`) are also left off the allowlist | Plugin hook |
| incident.io | All tools, until read tools are verified | Plugin hook (empty allowlist) |
| em-tools (own server) | `notes_create_person`, `notes_append_entry`, `notes_add_evidence`, `notes_update_frontmatter`, `notes_save_draft`, `notes_set_expectations_storage`, `notes_add_expectation` | Not blocked: they write only inside your notes folder, never delete, and keep a `.bak`. Skills call them only after you confirm the text |
