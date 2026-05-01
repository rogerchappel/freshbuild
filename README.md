# freshbuild

freshbuild is a local-first toolkit for detecting project build signals, watching
changed files, and producing verification proof-of-work artifacts.

It is intentionally small and conservative: it inspects files in the repository
you point it at, returns structured data, and leaves the decision to run commands
with the caller.

## Status

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
```

Stop the watcher when your process is done:

```js
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
