# Agent state

Portfolio upkeep, 2026-09-11. PR #60 is merged: implementation 5baf654,
application merge 88bce44. Incoming workflow-only update 3f8cc46 is preserved.

- [x] Preserve durable browser records with per-key temporary writes; 12 unit tests pass.
- [x] Add full JSON favorites export and confirmed removal that preserves the current pack.
- [x] Remove the embedded provider credential and repair the anonymous connection check.
- [x] Fix installed library API wrappers, enforce type checking and repair Bun CI installation.
- [x] Pass local and hosted builds, focused lint and nine synthetic browser scenarios.
- [x] Confirm all 34 public build files match the main CI artifact through both public entries.
- [x] Pass all five storage browser scenarios on the canonical production domain.
- [ ] Release the missing /test rewrite and verify live connection-page flows.
- [ ] Synchronize the original checkout while preserving its existing ignore edit and data.

The public Vercel alias has an existing 301 to the custom domain. The live
harness initially blocked that canonical host; its allowlist is repaired. It
then exposed an actual /test 404: the React route lacked a deployment rewrite.
The prepared fix preserves existing headers, adds only the exact route, makes
the local server read the shipped rewrites and includes config changes in CI.

Original collection/catalog files and local edits remain intact. Tests use
disposable records and intercepted providers. An additional fresh public-homepage
diagnostic ran normal startup in an empty browser; it did not use user collections
or provider credentials. No database records were accessed or changed.

Open follow-ups: retirement of the previously published provider key; 23 affected
package names in the unchanged dependency audit; the legacy GitHub Pages entry
serves uncompiled Vite source and its module path returns 404. Browser data remains
outside Supabase. This repair does not establish monthly cloud savings.
