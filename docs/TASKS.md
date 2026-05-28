# freshbuild Tasks

## MVP Complete

- [x] Package manager and package script detection.
- [x] Conservative safe script allowlist.
- [x] One-shot verification command.
- [x] File watcher with debounce and single-run locking.
- [x] Markdown and JSON proof artifacts.
- [x] Fixture-backed tests for planning, detection, runner commands, and proof rendering.
- [x] Smoke command against a local fixture.
- [x] README, safety notes, examples, and release notes.

## Release Candidate

- [x] TypeScript build configured.
- [x] `npm run check` passes.
- [x] `npm test` passes.
- [x] `npm run smoke` passes.
- [x] `bash scripts/validate.sh` passes.
- [ ] Release candidate PR opened.
- [ ] Branch protection applied best-effort.

## Next

- [ ] Add git-based changed-file discovery when no `--changed` flags are supplied.
- [ ] Add config file support for project-specific safe script presets.
- [ ] Add richer proof metadata for CI URLs and agent identity.
- [ ] Publish npm package after maintainer review.
