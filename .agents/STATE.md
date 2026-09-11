# Agent state

Portfolio upkeep, 2026-09-11. Collection repair PR #60 and routing follow-up
PR #61 are merged. The final application/configuration release is 4058345;
its Vercel production deployment is READY and all 34 public files match the
reviewed main CI artifact through both public entry URLs.

- [x] Preserve saved browser records when writes fail; all 12 storage regressions pass.
- [x] Export complete JSON favorites, including pending values and filtered cards.
- [x] Confirm bulk removal through the active backend and preserve the current pack.
- [x] Remove the embedded API credential; bound and cancel anonymous connection checks.
- [x] Repair installed UI library wrappers and enforce TypeScript checking in builds.
- [x] Restore /test deep links with an exact rewrite while retaining existing headers.
- [x] Pass local and hosted builds, focused lint and nine CI browser scenarios.
- [x] Verify nine live scenarios plus two focused custom-domain scenarios and 68 file comparisons.
- [x] Synchronize the original checkout; preserve all ten public files and its ignore additions, with backup/stash retained.

The Vercel alias has an existing 301 to the custom domain. Browser verification
allows only those known app hosts and intercepts provider requests with fixtures.
The local server reads the actual rewrite configuration. The live timeout returns
control in about 21 seconds; leaving aborts the check. Normal-flow warnings avoid
toast overlap. An earlier empty-browser homepage diagnostic allowed normal public
startup; it did not use saved user collections or provider credentials.

Remaining portfolio follow-ups: retire the previously published provider key;
address the unchanged audit graph (23 affected package names); repair or consolidate
the legacy GitHub Pages entry, which serves raw Vite source with a missing module
URL; review other catalog/cache/gameplay behavior and shared workflow costs.
Browser storage remains outside Supabase. No database records, collection schedules
or billing plans were changed, and monthly cloud savings are not established.

These notes and the decision journal do not change the verified application files.
The full portfolio goal remains active.
