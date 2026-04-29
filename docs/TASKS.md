# Task Brief: Implement package manager and build script detection

## Objective

Enable freshbuild to detect package managers and build scripts in the repository

## Repository

freshbuild

## Suggested Branch

agent/implement-package-manager-and-build-script-detection

## Task Type

feature

## Risk Level

Medium

## Context

Source: llm (openai:gpt-4.1-mini)

V1 scope requires detecting package manager/build scripts to know what tasks to watch and run

## Allowed Paths

- src/detection/**
- src/utils/**

## Forbidden Paths

- src/ci/**
- src/remote/**

## Expected Commits

- feat: add package manager detection module
- feat: add build script detection logic

## Verification

- Unit tests for detection logic
- Fixture tests with various repo setups

## Stop Conditions

- Detection works reliably on common package managers
- Tests pass without flaky failures

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Implement detection of package managers and build scripts to support targeted build watching.

---

# Task Brief: Implement file change watcher with debounce and locking

## Objective

Watch changed files and trigger targeted checks with debounce and locking to avoid redundant runs

## Repository

freshbuild

## Suggested Branch

agent/implement-file-change-watcher-with-debounce-and-locking

## Task Type

feature

## Risk Level

Medium

## Context

Source: llm (openai:gpt-4.1-mini)

V1 scope requires watching changed files and running checks efficiently with debounce and locking

## Allowed Paths

- src/watcher/**

## Forbidden Paths

- src/ci/**
- src/remote/**

## Expected Commits

- feat: add file watcher with debounce
- feat: implement locking mechanism for watcher

## Verification

- Unit tests for watcher debounce and locking behavior
- Integration tests simulating file changes

## Stop Conditions

- Watcher triggers checks correctly with debounce
- No race conditions or duplicate runs

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Build a file watcher that debounces events and locks to prevent duplicate check runs.

---

# Task Brief: Run targeted checks based on changed files

## Objective

Run the smallest useful checks based on detected changed files to optimize feedback speed

## Repository

freshbuild

## Suggested Branch

agent/run-targeted-checks-based-on-changed-files

## Task Type

feature

## Risk Level

Medium

## Context

Source: llm (openai:gpt-4.1-mini)

V1 scope requires running targeted checks rather than full builds to speed feedback

## Allowed Paths

- src/checks/**

## Forbidden Paths

- src/ci/**
- src/remote/**

## Expected Commits

- feat: implement targeted check runner
- test: add tests for check selection

## Verification

- Unit tests for check selection logic
- Integration tests verifying correct checks run on file changes

## Stop Conditions

- Checks run correctly and efficiently for changed files

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Implement logic to run targeted checks based on changed files to optimize build feedback.

---

# Task Brief: Write verification summary in Markdown and JSON

## Objective

Generate verification summaries in Markdown and JSON formats for proof-of-work artifacts

## Repository

freshbuild

## Suggested Branch

agent/write-verification-summary-in-markdown-and-json

## Task Type

feature

## Risk Level

Low

## Context

Source: llm (openai:gpt-4.1-mini)

V1 scope requires writing verification summaries to document build results for PRs

## Allowed Paths

- src/output/**

## Forbidden Paths

- src/ci/**
- src/remote/**

## Expected Commits

- feat: add verification summary generation in Markdown
- feat: add verification summary generation in JSON

## Verification

- Unit tests for summary generation
- Manual verification of output formats

## Stop Conditions

- Verification summaries generated correctly in both formats

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Implement generation of verification summaries in Markdown and JSON formats.

---

# Task Brief: Write unit and fixture tests for core parsing and generation behavior

## Objective

Ensure core parsing and generation logic is reliable and correct

## Repository

freshbuild

## Suggested Branch

agent/write-unit-and-fixture-tests-for-core-parsing-and-generation-behavior

## Task Type

test

## Risk Level

Low

## Context

Source: llm (openai:gpt-4.1-mini)

Verification requires unit or fixture tests for core parsing and generation behavior

## Allowed Paths

- tests/unit/**
- tests/fixtures/**

## Forbidden Paths

- src/ci/**
- src/remote/**

## Expected Commits

- test: add unit tests for parsing logic
- test: add fixture tests for generation behavior

## Verification

- All unit and fixture tests pass

## Stop Conditions

- Coverage for core parsing and generation logic is sufficient

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Write comprehensive unit and fixture tests for core parsing and generation logic.

---

# Task Brief: Write README with install, quickstart, and safety notes

## Objective

Provide clear documentation for installation, quickstart usage, and safety considerations

## Repository

freshbuild

## Suggested Branch

agent/write-readme-with-install-quickstart-and-safety-notes

## Task Type

documentation

## Risk Level

Low

## Context

Source: llm (openai:gpt-4.1-mini)

Verification requires README with install, quickstart, and safety notes

## Allowed Paths

- README.md

## Forbidden Paths

- src/**

## Expected Commits

- docs: add README with install and quickstart
- docs: add safety notes to README

## Verification

- Manual review of README content
- User feedback on clarity

## Stop Conditions

- README covers install, quickstart, and safety notes clearly

## Review Pack Required

No.

## Human Decision Needed

- None

## Agent Prompt

Write README documentation covering installation, quickstart, and safety notes.

---

# Task Brief: Document local-first behavior clearly

## Objective

Ensure users understand freshbuild operates locally without hidden network or credential usage

## Repository

freshbuild

## Suggested Branch

agent/document-local-first-behavior-clearly

## Task Type

documentation

## Risk Level

Low

## Context

Source: llm (openai:gpt-4.1-mini)

Verification requires local-first behavior documented clearly

## Allowed Paths

- docs/**
- README.md

## Forbidden Paths

- src/ci/**
- src/remote/**

## Expected Commits

- docs: add local-first behavior documentation

## Verification

- Manual review of documentation
- User feedback on clarity

## Stop Conditions

- Local-first behavior is clearly documented

## Review Pack Required

No.

## Human Decision Needed

- None

## Agent Prompt

Document freshbuild's local-first behavior clearly to users.

---

# Task Brief: Verify no hidden network, credential, or publish behavior

## Objective

Ensure freshbuild does not perform any hidden network calls, credential usage, or publishing

## Repository

freshbuild

## Suggested Branch

agent/verify-no-hidden-network-credential-or-publish-behavior

## Task Type

security

## Risk Level

High

## Context

Source: llm (openai:gpt-4.1-mini)

Verification requires no hidden network, credential, or publish behavior

## Allowed Paths

- src/**

## Forbidden Paths

- src/remote/**
- src/ci/**

## Expected Commits

- chore: audit code for hidden network and credential usage

## Verification

- Code audit for network and credential usage
- Automated scans for network calls
- Manual testing in offline environment

## Stop Conditions

- No hidden network or credential usage detected

## Review Pack Required

Yes.

## Human Decision Needed

- Confirm no hidden network or credential usage

## Agent Prompt

Audit code to verify no hidden network, credential, or publish behavior exists.
