# Roadmap

This roadmap describes intended direction, not a binding delivery promise.
Review it regularly and update it as the project learns from users,
contributors, and implementation constraints.

## Now

- Stabilize the initial CLI MVP through release candidate review.
- Keep verification output predictable for agent-authored pull requests.
- Document safe usage clearly for local repositories.

## Next

- Add git changed-file discovery.
- Add config file support for project-specific allowlists.
- Improve proof metadata for CI and multi-agent workflows.

## Later

- Consider larger features after the core workflow is stable.
- Add automation only where it removes repeated maintainer work.
- Revisit packaging, deployment, or integration options based on real demand.

## Not Planned

- Unrelated platform rewrites without a clear migration path.
- Mandatory dependencies on a single ecosystem unless the project requires it.
- Public release dates before maintainers are ready to commit to them.

## Roadmap Review

Before each major or meaningful minor release:

- Move completed user-visible work into `CHANGELOG.md`.
- Remove stale commitments.
- Promote only the next reviewable set of work into `Now`.
