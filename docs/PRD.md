# freshbuild PRD

## Pitch

freshbuild is an agent-friendly local build watcher that understands package
manager scripts, reruns the smallest useful checks for changed files, and emits
proof-of-work artifacts for handoffs and pull requests.

## Users

- OSS maintainers reviewing agent-authored changes
- local coding agents that need deterministic verification receipts
- developers who want a small alternative to ad-hoc `npm test` loops

## V1 goals

1. Detect package manager evidence from `package.json` and lockfiles.
2. Detect and categorize useful scripts: check, typecheck, test, lint, build.
3. Snapshot/watch project files while ignoring noisy directories.
4. Plan minimal checks from changed file paths.
5. Run checks with debounce/locking primitives and conservative allowlists.
6. Emit Markdown and JSON verification summaries.
7. Stay local-first with no hidden network, credentials, publish, or daemon
   behavior.

## Non-goals

- CI replacement
- remote execution service
- IDE extension
- arbitrary shell automation
- package installation or dependency management

## MVP acceptance

- `npm test`, `npm run check`, `npm run smoke`, and `npm run validate` pass.
- A real CLI smoke writes verification summaries against a fixture project.
- Unsafe package scripts are skipped with clear warnings.
- README and docs explain safety/privacy tradeoffs.
