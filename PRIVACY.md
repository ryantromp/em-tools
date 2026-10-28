# Privacy policy

Last updated: 2026-10-28. This covers the em-tools plugin, published by Ryan Tromp at https://github.com/ryantromp/em-tools.

## What em-tools collects

Nothing. em-tools has no backend, account, telemetry, analytics or crash reporting. The publisher receives no data from your use of it.

## Where your data goes

- **Your notes folder.** People notes, drafts and hiring documents are markdown files in a folder you choose. The bundled em-tools server reads and writes only inside that folder, keeps a `.bak` copy before each change, never deletes notes, and makes no network calls.
- **Your Claude conversation.** When a skill reads a note or an export, that text becomes part of your conversation with Claude. It is processed by Anthropic under the terms of your Claude plan, the same as anything else you type or paste. em-tools does not change how Anthropic handles conversation data.
- **Connectors you enable.** em-tools can read from GitHub, Jira, Linear, Google Calendar, Outlook (Microsoft Work IQ), Slack, Teams, PagerDuty and incident.io. Each runs through the vendor's own MCP server, signed in as you, and each vendor's privacy policy applies. em-tools calls only their read tools.

## What em-tools never does

- Send, post or comment on your behalf. Outputs are drafts you copy.
- Store data in the cloud.
- Show per-person AI usage. That data is summed in memory and per-person rows are never shown or saved.

## Your choices

- Leave connectors off and paste exports instead. Every skill works that way.
- Delete your notes folder at any time. Uninstalling em-tools does not touch it.

## Contact

Open an issue at https://github.com/ryantromp/em-tools/issues.
