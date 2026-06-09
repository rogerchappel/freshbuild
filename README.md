# freshbuild

freshbuild is a local-first check planner and proof runner for agent-assisted
development loops. It detects the package manager, plans relevant project
checks, runs them with bounded timeouts, and writes verification summaries that
can be attached to a PR or handoff.

## Status

This is a v0.1.0 developer tool. Treat the CLI output and summary schema as
early-stage, pin versions in automation, and run the verification commands below
before relying on it in CI.

## Install from a checkout

```sh
git clone https://github.com/rogerchappel/freshbuild.git
cd freshbuild
npm install
```

## CLI Quickstart

Inspect a project and print the planned checks:

```sh
node src/cli.js plan --root test/fixtures/npm-project --changed src/index.js
```

Run the selected checks and write verification artifacts:

```sh
node src/cli.js run --root test/fixtures/smoke-project --changed src/index.js --output .freshbuild/demo
```

For a quick manual check, show the maintained fixture watcher example:

```sh
node examples/basic-watch.js
```

## Verification

```sh
npm run check
npm test
npm run smoke
npm run package:smoke
npm run release:check
```

`release:check` runs syntax/test checks, the fixture smoke command, and a dry-run
`npm pack` so release contents are visible before publishing.

## Limitations

- The package is still v0.1.0 and may change CLI flags or summary fields before
  a stable 1.0 release.
- Check planning is heuristic; review generated summaries before committing or
  relying on them for release decisions.
- freshbuild runs local package scripts and should be pointed only at projects
  whose scripts you trust.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Keep changes small, update the PRD or README when scope changes, and include the exact verification command in every pull request.

## Security

See [SECURITY.md](SECURITY.md). Do not include secrets, private tokens, proprietary dependency data, or sensitive logs in public issues or examples.

## License

MIT

Release verification scripts not already covered above:

- `npm run test` - node --test
