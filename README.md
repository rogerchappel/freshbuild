# freshbuild

freshbuild is a local-first build watcher for agent work: it detects the package
manager and project scripts, chooses the smallest useful checks from changed
files, runs only allowlisted local scripts, and writes proof-of-work artifacts a
human can review.

It is intentionally boring in the best way. No cloud service, no daemon account,
no hidden telemetry — just fast local feedback and receipts.

## Install

```sh
npm install -D freshbuild
```

Or run from a checkout:

```sh
npm install
npm test
npm run smoke
```

## CLI quickstart

Plan checks without running anything:

```sh
npx freshbuild plan --changed src/index.js,test/index.test.js
```

Run selected checks and write `.freshbuild/verification-summary.md` plus JSON:

```sh
npx freshbuild run --changed src/index.js --output .freshbuild
```

Optionally keep agent-friendly defaults in `.freshbuild.json`:

```json
{
  "changedFiles": ["src/index.js"],
  "allowCategories": ["check", "test"],
  "outputDirectory": ".freshbuild"
}
```

Smoke it against this repo's fixture project:

```sh
node src/cli.js run --root test/fixtures/smoke-project --changed src/index.js --output .freshbuild/smoke
```

## Library quickstart

```js
import { planChecks, runChecks, watchProjectFiles, DebouncedCheckRunner } from 'freshbuild';

const plan = await planChecks(process.cwd(), { changedFiles: ['src/index.js'] });
console.log(plan.checks.map((check) => check.name));

const result = await runChecks(process.cwd(), {
  changedFiles: ['src/index.js'],
  outputDirectory: '.freshbuild'
});
console.log(result.status, result.artifacts);

const runner = new DebouncedCheckRunner(process.cwd(), { outputDirectory: '.freshbuild' });
const watcher = watchProjectFiles(process.cwd(), {
  intervalMs: 500,
  onChange: (event) => runner.schedule(event.changedFiles)
});
await watcher.start();
```

## What gets selected

freshbuild maps changed files to conservative categories:

- package metadata: check, typecheck, test, build, lint
- source files: check, typecheck, test, lint, build
- tests: test, lint
- docs/config: check/lint/test where scripts exist

Only the first matching script per category is selected, in stable order. Exact
canonical names win over suffix variants (`test` before `test:unit`, `check`
before `validate`), then ties are sorted by script name. That keeps agent loops
short, deterministic, and still useful enough to produce meaningful proof.

## Safety and privacy

freshbuild is local-first by design:

- no hidden network calls, telemetry, publishing, or registry access
- no credential discovery; it does not read tokens, SSH keys, or git credentials
- no shell string execution; child processes use `shell: false`
- only detected package-manager `run <script>` commands are considered
- script names, package managers, first command tokens, and shell control tokens
  are checked against default allowlists before a run
- refused checks are recorded as skipped in the verification summary

A package script can still do whatever its repository author wrote, so run
freshbuild in repositories you trust and keep script allowlists tight for agents.

## Proof artifacts

A run writes:

- `.freshbuild/verification-summary.md`
- `.freshbuild/verification-summary.json`

The summaries include changed files, selected checks, status, durations, warnings,
and bounded per-check notes. Markdown is meant for humans reviewing an agent PR;
JSON uses a versioned schema for tools that want to archive or compare receipts.

## Commands

```sh
freshbuild plan [--root DIR] [--changed a,b] [--config FILE]
freshbuild run  [--root DIR] [--changed a,b] [--config FILE] [--dry-run] [--output DIR] [--timeout MS]
freshbuild once [same options as run]
```

Use `run --dry-run` when an agent needs a local proof plan without executing
repository scripts. Refused checks are recorded as skipped with the safety reason
instead of silently disappearing.

## Verify this repository

```sh
npm test
npm run check
npm run smoke
npm run validate
```

## Documentation

- [Product requirements](docs/PRD.md)
- [Task plan](docs/TASKS.md)
- [Orchestration handoff](docs/ORCHESTRATION.md)
- [Local-first guarantees](docs/LOCAL_FIRST.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## License

MIT
