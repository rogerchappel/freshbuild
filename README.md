# freshbuild

freshbuild is a local-first toolkit for detecting project build signals, watching
changed files, and producing verification proof-of-work artifacts.

The idea is simple: watch a repository, rerun the smallest useful checks after a
change, and write proof-of-work artifacts that humans and agents can attach to a
handoff or pull request.

## Why this exists

Fast agent loops break down when verification is slow, noisy, or undocumented.
`freshbuild` is scoped to make local feedback tighter without turning into a CI
replacement.

This repository is early-stage. The targeted check runner is not implemented yet;
it remains blocked pending explicit approval because debounce/locking behavior can
start processes and introduce race-condition risk. Current modules are detection,
file watching, and verification summary generation.

## Install

```sh
npm install freshbuild
```

For local development from this repository:

```sh
npm install
npm test
```

freshbuild uses standard Node.js ECMAScript modules and has no runtime package
dependencies.

## Quickstart

Detect the package manager and build-related package scripts:

```js
import {
  detectBuildScripts,
  detectPackageManager,
  renderVerificationSummaryMarkdown,
  watchProjectFiles
} from 'freshbuild';

const packageManager = await detectPackageManager(process.cwd());
const buildScripts = await detectBuildScripts(process.cwd());

console.log(packageManager.packageManager);
console.log(buildScripts.scriptsByCategory);

const watcher = watchProjectFiles(process.cwd(), {
  intervalMs: 500,
  onChange(event) {
    console.log('changed files:', event.changedFiles);
  }
});

await watcher.start();

const markdown = renderVerificationSummaryMarkdown({
  project: 'my-project',
  overallStatus: 'passed',
  checks: [{ name: 'unit tests', status: 'passed', command: 'npm test' }],
  changedFiles: ['src/index.js']
});

console.log(markdown);

await watcher.stop();
```

## Verification summaries

freshbuild can create Markdown and JSON verification summaries for pull-request
review packs:

```js
import { writeVerificationSummary } from 'freshbuild';

await writeVerificationSummary(
  {
    project: 'my-project',
    branch: 'agent/example',
    commit: 'abc1234',
    checks: [{ name: 'test suite', status: 'passed', command: 'npm test' }],
    artifacts: [{ path: 'coverage/index.html', type: 'html' }]
  },
  { outputDirectory: '.freshbuild' }
);
```

This writes `.freshbuild/verification-summary.md` and
`.freshbuild/verification-summary.json`.

## Planned V1

The scoped first version remains deliberately small:

- detect package managers and useful project scripts
- watch changed files with conservative defaults
- emit Markdown and JSON verification summaries
- keep command execution explicit and caller-controlled
- stay local-first by default

See [docs/PRD.md](docs/PRD.md) for the scoped V1 definition.

## Local-first safety notes

- No hidden network access: core modules do not call remote APIs, publish data,
  install dependencies, or contact package registries.
- No credential access: freshbuild does not read environment secrets, SSH keys,
  npm tokens, or Git credentials.
- No command execution in current modules: detection reads package metadata,
  watchers poll filesystem state, and summary output writes local files only.
- Ignored noisy directories include `.git`, `node_modules`, `.freshbuild`,
  `dist`, `build`, and `coverage` by default.
- Callers are responsible for choosing whether to run build/test commands from
  detected scripts.

## Verify this repository

Run the local validation script before opening a pull request:

```sh
bash scripts/validate.sh
```

`scripts/validate.sh` checks required files and runs available package scripts.
Missing optional `agent-qc` is treated as a skip, not a failure.

## Documentation

- [Documentation index](docs/README.md)
- [Local-first security guarantees](docs/LOCAL_FIRST.md)
- [Contributing guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## License

MIT
