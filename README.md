# freshbuild

`freshbuild` is a local-first TypeScript CLI that detects package scripts, runs the smallest safe verification set, and writes proof artifacts agents can attach to pull requests.

It is intentionally boring: no daemon, no remote execution, no telemetry, no publishing, and no hidden network behavior.

## Install

```sh
npm install
npm run build
```

Use the local CLI during development:

```sh
node dist/src/cli.js --help
```

After packaging, the executable is `freshbuild`.

## Quickstart

Run safe checks once and write `.freshbuild/verification.md` plus `.freshbuild/verification.json`:

```sh
npx freshbuild run
```

Run against a specific fixture or repository:

```sh
npx freshbuild run --root fixtures/npm-basic --script test --out .freshbuild/smoke
```

Watch files and refresh proof output after changes:

```sh
npx freshbuild watch --script test --debounce 750
```

## Safety Model

By default `freshbuild` only runs package scripts with these names:

- `check`
- `typecheck`
- `lint`
- `test`
- `build`
- `smoke`

It does not execute arbitrary shell strings from the CLI. It delegates to the detected local package manager for allowed package scripts only. To opt into a different script name, pass `--allow <script>` and request it with `--script <script>`.

## Proof Output

Each run writes:

- `verification.md`: PR-friendly summary with status, commands, and changed files.
- `verification.json`: machine-readable summary for orchestration.

Skipped runs exit with code `2`, failed checks exit with code `1`, and passing checks exit with code `0`.

## Verification

```sh
npm run check
npm test
npm run smoke
bash scripts/validate.sh
```

## Documentation

- [Product requirements](docs/PRD.md)
- [Task plan](docs/TASKS.md)
- [Orchestration notes](docs/ORCHESTRATION.md)
- [Safety guide](safety/README.md)
- [Examples](examples/README.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Changes should be small, reviewable, and verified before review.

## Security

See [SECURITY.md](SECURITY.md). Do not report suspected vulnerabilities with exploit details in public issues.

## License

MIT
