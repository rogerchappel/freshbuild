# Orchestration

`freshbuild` is designed for local agent loops and CI smoke checks. The CLI stays inside the repository it is pointed at and writes artifacts under the requested output directory.

## Commands

- `freshbuild run`: detect safe scripts, run them once, and write proof.
- `freshbuild watch`: watch local files, debounce changes, serialize runs, and rewrite proof.

## Exit Codes

- `0`: verification passed.
- `1`: one or more commands failed.
- `2`: no safe command was selected.

## Artifact Contract

The JSON artifact is stable enough for early orchestration:

```json
{
  "generatedAt": "2026-05-29T00:00:00.000Z",
  "root": "/repo",
  "packageManager": "npm",
  "changedFiles": ["src/index.ts"],
  "status": "passed",
  "reason": "Selected safe package scripts from changed file categories.",
  "results": []
}
```

Agents should attach `verification.md` to pull requests and keep `verification.json` for machine parsing.

## Limitations

- Changed-file detection is caller-supplied in V1.
- Script safety is based on script names, not static analysis of script bodies.
- Watch mode is local-only and does not replace CI.
