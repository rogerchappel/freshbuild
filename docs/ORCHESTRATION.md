# Orchestration Handoff

## Repository

- Repo: `rogerchappel/freshbuild`
- Main branch: `main`
- Worktree used by factory: `/Users/roger/Developer/my-opensource/.worktrees/freshbuild-factory-20260503-0630`

## Build waves

1. Foundation: package manager and script detection.
2. Filesystem: project snapshot/diff watcher.
3. Runner: changed-file planner, safety allowlists, sequential locked runner, debounce wrapper.
4. Proof: Markdown/JSON verification artifacts.
5. Docs/tests: README, local-first notes, fixtures, CLI smoke.

## Verification commands

```sh
npm test
npm run check
npm run smoke
npm run validate
node src/cli.js run --root test/fixtures/smoke-project --changed src/index.js --output .freshbuild/manual-smoke
```

## Review notes

- Runner intentionally executes only package-manager `run <script>` arrays with
  `shell: false` after safety validation.
- Package script contents are inspected for an allowlisted first command token and
  refused if shell control tokens are present.
- Proof artifacts are local files under `.freshbuild/` unless the caller chooses
  another output directory.
