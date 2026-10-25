# RFC: Ledger export v2

Author: Engineer A7. Status: In review. Created 2026-10-12.

## Summary
Replace the nightly ledger CSV export with an incremental export that Finance can pull every hour.

## Background
Finance reconciles payouts from a CSV that is generated at 02:00 UTC. When a payout batch fails late in the day, Finance cannot see it until the next morning. The legacy CSV path also has three open TODOs and fails about once a month.

## Proposal
- Add an export table keyed by ledger entry id and updated_at.
- Expose an authenticated endpoint that returns entries changed since a cursor.
- Keep the nightly CSV running in parallel for one month, then remove it.
- Files touched: src/ledger/export.ts, src/ledger/model.ts, src/api/routes/finance.ts.

## Open questions
- Should the endpoint page by count or by time window?
- Who in Finance signs off on the field list?

## Alternatives considered
- Streaming entries to Finance's warehouse directly. Rejected: Finance has no streaming ingest.
