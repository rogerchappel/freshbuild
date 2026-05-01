# freshbuild

`freshbuild` is a planned local-first build watcher for agent-driven software
workflows.

The idea is simple: watch a repository, rerun the smallest useful checks after a
change, and write proof-of-work artifacts that humans and agents can attach to a
handoff or pull request.

## Why this exists

Fast agent loops break down when verification is slow, noisy, or undocumented.
`freshbuild` is scoped to make local feedback tighter without turning into a CI
replacement.

## Planned V1

The current product brief targets a small deterministic core:

- detect the package manager and useful project scripts
- watch changed files with debounce and locking
- rerun targeted checks instead of the whole world
- emit Markdown and JSON verification summaries
- stay local-first by default

## Current status

This repository is still at the scaffold-and-product-docs stage. The shipped
code is not feature complete yet, so treat the repository as a design and build
surface rather than a finished tool.

See [docs/PRD.md](docs/PRD.md) for the scoped V1 definition.

## Development

```sh
pnpm install
node --test
```

Before opening a PR, run:

```sh
bash scripts/validate.sh
```

## Safety and operating model

`freshbuild` is intended to be local-first. Verification should be explicit,
reviewable, and easy to audit before anything is reported as done.

## License

MIT
