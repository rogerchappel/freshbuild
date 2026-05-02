# Local-first behavior and security guarantees

freshbuild is designed for local agent loops and human review.

## Guarantees

- It does not call remote APIs or send telemetry.
- It does not install packages, publish packages, or mutate git remotes.
- It does not read credentials intentionally: no npm tokens, SSH keys, env secret
  scanning, or git credential helper calls.
- Watch output and proof artifacts stay on disk under `.freshbuild/` unless the
  caller chooses another local directory.
- Child processes are spawned with `shell: false`.

## Command safety model

The runner only considers scripts detected from local `package.json`. Before a
check runs, freshbuild validates:

- package manager is one of npm, pnpm, yarn, bun
- script name matches a conservative check/test/lint/typecheck/build allowlist
- run command is exactly package-manager `run <script>`
- the first token of the script body is in a known tool allowlist
- shell control tokens such as `&&`, `|`, redirection, backticks, and `$` are
  refused by default

Rejected checks are not hidden; they appear as skipped with warnings in the
verification summary.

## Remaining risk

Package scripts are repository-owned code. If you do not trust a repository's
scripts, use `freshbuild plan` or `freshbuild run --dry-run` first and review the
plan before executing.
