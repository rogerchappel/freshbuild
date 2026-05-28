# Release Notes

## 0.1.0 Release Candidate

Classification: local-first TypeScript CLI MVP.

### Added

- Package manager detection for npm, pnpm, yarn, and bun.
- Safe package script planning with a conservative default allowlist.
- `freshbuild run` for one-shot verification.
- `freshbuild watch` for debounced local checks.
- Markdown and JSON proof artifacts.
- Fixture-backed tests and a smoke command.
- Safety, orchestration, and usage documentation.

### Verification

- `npm install`
- `npm run check`
- `npm test`
- `npm run smoke`
- `bash scripts/validate.sh`

### Limitations

- V1 does not discover git changes automatically; callers can pass `--changed`.
- Script safety is name-based and depends on maintainers keeping package scripts safe.
- Watch mode is local process orchestration, not a CI replacement.
