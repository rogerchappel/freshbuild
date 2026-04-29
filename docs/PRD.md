# freshbuild

Status: ready

## Scorecard

Total: 80/100
Band: build now
Last scored: 2026-04-29
Scored by: Neo

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 17/20 | Directly addresses a repeated workflow pain. |
| Demand signal | 16/20 | Some signal, but needs more external validation. |
| V1 buildability | 17/20 | Small deterministic V1 is feasible. |
| Differentiation | 11/15 | Useful angle, but category has adjacent competition. |
| Agentic workflow leverage | 14/15 | Improves agent throughput or supervision. |
| Distribution potential | 5/10 | Distribution will require examples and content. |

## Pitch

An agent-friendly build watcher that understands repo task scripts, reruns the smallest useful checks, and emits proof-of-work artifacts for PRs.

## Why It Matters

Agents need fast feedback. Generic watch tools exist, but agent proof/reporting is the wedge.

## Qualification

Poltergeist shows demand for universal build watching. Internal need exists across all small OSS repos where agents must prove work quickly.

Source / adjacent research: Inspired by steipete/poltergeist, universal file watcher/build automation with 385 stars / 31 forks checked 2026-04-29.

Decision: build now

## V1 Scope

- Detect package manager/build scripts
- Watch changed files
- Run targeted checks with debounce/locking
- Write verification summary Markdown/JSON

## Out of Scope

- Full CI replacement
- Remote execution daemon
- Complex IDE plugin

## Verification

- Unit or fixture tests for core parsing/generation behavior.
- README with install, quickstart, and safety notes.
- Local-first behavior documented clearly.
- No hidden network, credential, or publish behavior.

## Agent Prompt

Build `freshbuild` as a local watcher that optimizes for deterministic proof output and safe command allowlists.
