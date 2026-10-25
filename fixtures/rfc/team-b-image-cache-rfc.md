# RFC: Replace the image cache

Author: Engineer B6. Status: Accepted 2026-08-20.

## Summary
Replace the custom image cache with the platform cache on iOS and Android.

## Problem
The custom cache causes the iOS 18 login loop when it is cleared during sign-in (INC-TEAMB-2), and it has no size limit.

## Proposal
- Use the platform cache with a 200 MB limit.
- Remove the custom cache code in /shared/images/.
- Roll out behind the image-cache-v2 flag to 10%, then 50%, then 100% over two weeks.

## Success criteria
- No login loops linked to the image cache for 30 days after full rollout.
- Cache size stays under 200 MB on 99% of devices.

## Rollout and rollback
Flag-based. Roll back by turning the flag off.

## Risks
- Offline images may load more slowly on first launch.
