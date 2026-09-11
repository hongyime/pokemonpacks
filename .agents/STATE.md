# Agent state

Portfolio upkeep, 2026-09-11. Start from deployed/main 9d6db42; preserve the
original checkout's ignore-file edit and all bundled card data.

- [x] Trace quota handling, fallback reads and the storage warning UI.
- [x] Reproduce the storage failures using synthetic records: baseline 2 pass / 10 fail.
- [x] Implement per-key volatile updates without eviction; all 12 storage tests pass.
- [x] Remove the embedded credential from proposed client source without using it.
- [x] Repair chart/resizable wrappers for the installed APIs; both TypeScript projects pass.
- [x] Implement full JSON favorites export and backend-aware confirmed removal; five browser storage scenarios pass.
- [ ] Complete final build, lint, isolated browser flows, CI, release and production verification.

Bun frozen-lockfile install passed with the existing bun.lockb unchanged. The
initial npm ci attempt was the wrong manager, not a repository install defect.
Type checking, Vite/PWA, all twelve storage regressions and focused lint pass.
Five browser storage scenarios and four API scenarios pass with synthetic data.
API tests confirm an actual twenty-second timeout and cancellation on leaving.
A visual check caught toasts obscuring the storage warning. The warning now uses
normal page layout; the final build and all nine browser scenarios pass, with
no browser errors or live provider requests. Mobile and desktop images were reviewed.
No commit or deployment has occurred.

All ten public files in the original checkout retain baseline hashes. The
worktree preserves eight byte-for-byte; meta.json and sw.js differ only in Git
checkout line endings. The original ignore-file edit is untouched. No real collections,
provider requests or provider credentials were used in tests. Credential removal
does not revoke the existing provider key; retirement remains pending.

Browser storage is an existing non-Supabase dependency. This repair does not
migrate records or establish monthly cloud savings.

The connection check now makes one anonymous request and does not pretend to
rewrite bundled CSV/JSON files. CI installs the frozen Bun dependencies, checks
TypeScript, tests the built app and retains artifacts for three days. The audit
reports 23 affected package names across the dependency graph; dependency cleanup
remains queued, and this is not a clean-audit or cloud-cost claim.
