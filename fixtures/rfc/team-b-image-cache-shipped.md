What shipped for "Replace the image cache", notes by Manager B, 2026-10-16.

- iOS moved to the platform cache with a 250 MB limit (raised from 200 MB after testing).
- Android is still on the custom cache; the change is planned for Sprint 15.
- The rollout went 10% then 100% in one week; the 50% step was skipped.
- The custom cache code in /shared/images/ is still in the repo because Android uses it.
- No login loops linked to the image cache since 2026-09-20.
