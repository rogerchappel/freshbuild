# Safety

`freshbuild` is local-first. It reads `package.json`, selects allowed script names, invokes the local package manager, and writes proof artifacts.

## Defaults

- No telemetry.
- No credential reads.
- No publishing.
- No remote execution.
- No background service.
- No arbitrary CLI shell command execution.

## Script Allowlist

Default script names are limited to common verification commands:

- `check`
- `typecheck`
- `lint`
- `test`
- `build`
- `smoke`

Use `--allow` only for repository-local scripts that are safe to run repeatedly.

## Maintainer Guidance

Review package scripts before using `freshbuild` on an unfamiliar repository. A safe script name can still contain unsafe behavior if the repository author put unsafe commands in `package.json`.
