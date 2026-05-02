# freshbuild Tasks

## Done

- Detect package managers from `packageManager` and common lockfiles.
- Detect and categorize build/test/check/lint/typecheck scripts.
- Watch project files using deterministic polling snapshots.
- Diff snapshots into created/modified/deleted file changes.
- Plan smallest useful checks from changed file paths.
- Validate planned checks against safe package manager, script name, command token,
  and shell-control-token allowlists.
- Run checks sequentially with `shell: false`, timeout handling, and run locking.
- Provide `DebouncedCheckRunner` for watcher integrations.
- Emit Markdown and JSON proof-of-work artifacts.
- Add fixture/unit/smoke tests and CLI entry point.
- Refresh README, local-first/security, orchestration, contribution docs.

## Next

- Add config file support for custom categories and stricter allowlists.
- Add richer monorepo/package workspace detection.
- Add optional git integration to infer changed files.
- Add coverage output examples.
