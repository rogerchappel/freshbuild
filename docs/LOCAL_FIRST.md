# Local-first behavior and security guarantees

freshbuild is designed to run against local repository state without surprising
side effects.

## What freshbuild does locally

- Reads `package.json` and known lockfiles to detect package managers.
- Reads `package.json#scripts` to categorize build, test, lint, check, and
  typecheck scripts.
- Polls local file metadata to detect created, modified, and deleted files.
- Writes optional verification summaries to caller-selected local paths.

## What freshbuild does not do

- It does not contact remote services or package registries.
- It does not publish packages, push Git branches, open pull requests, or mutate
  remote state.
- It does not read credentials such as npm tokens, SSH keys, Git credentials, or
  arbitrary environment secrets.
- It does not execute detected package scripts in the current implemented
  modules.

## Caller responsibilities

freshbuild returns structured signals. If an application chooses to run commands
based on those signals, that application should:

1. Show or log the exact command it will run.
2. Run the smallest useful check for the changed files.
3. Add debounce and locking before long-running processes.
4. Avoid forwarding source, logs, summaries, or credentials to remote systems
   unless the user explicitly enables that behavior.

The targeted check runner is intentionally not present in this implementation
wave because process execution, debounce, and locking behavior require explicit
approval before implementation.

## Default ignored directories

The file watcher skips common high-noise directories by default:

- `.git`, `.hg`, `.svn`
- `node_modules`
- `.freshbuild`, `.turbo`, `.next`
- `dist`, `build`, `coverage`

Callers can add more ignored directory names through watcher options.
