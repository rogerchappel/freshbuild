# Task Brief: Implement package manager and build script detection

## Objective

Enable freshbuild to detect the package manager and build scripts used in a repository

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

V1 scope requires detecting package manager/build scripts to run targeted checks

## Allowed Paths

- src/detection/**
- src/utils/**

## Forbidden Paths

- src/ci/**
- src/remote/**

## Expected Commits

- Add detection module for package managers
- Add detection module for build scripts
- Add tests for detection logic

## Verification

- Unit tests covering detection logic
- Fixture tests with various repo setups

## Stop Conditions

- Detection works reliably on common package managers and build scripts
- Tests pass without flaky behavior

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Implement detection of package managers and build scripts in freshbuild to support targeted build checks.

---

# Task Brief: Implement file watcher for changed files

## Objective

Watch for changed files in the repository to trigger targeted checks

## Repository

freshbuild

## Suggested Branch

agent/implement-file-watcher-for-changed-files

## Task Type

feature

## Risk Level

Medium

## Context

Source: llm (openai:gpt-4.1-mini)

V1 scope requires watching changed files to rerun smallest useful checks

## Allowed Paths

- src/watcher/**

## Forbidden Paths

- src/ci/**
- src/remote/**

## Expected Commits

- Add file watcher module
- Add tests for file watcher

## Verification

- Unit tests for file watcher behavior
- Integration tests simulating file changes

## Stop Conditions

- File watcher triggers on file changes as expected
- No excessive resource usage or missed events

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Implement a file watcher in freshbuild that detects changed files to trigger targeted checks.

---

# Task Brief: Implement targeted check runner with debounce and locking

## Objective

Run targeted build checks efficiently with debounce and locking to avoid redundant runs

## Repository

freshbuild

## Suggested Branch

agent/implement-targeted-check-runner-with-debounce-and-locking

## Task Type

feature

## Risk Level

High

## Context

Source: llm (openai:gpt-4.1-mini)

V1 scope requires running targeted checks with debounce/locking to optimize feedback speed

## Allowed Paths

- src/check_runner/**

## Forbidden Paths

- src/ci/**
- src/remote/**

## Expected Commits

- Add check runner with debounce and locking
- Add tests for debounce and locking

## Verification

- Unit tests for debounce and locking logic
- Integration tests verifying no redundant runs

## Stop Conditions

- Targeted checks run correctly with debounce and locking
- No race conditions or deadlocks occur

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Implement targeted check runner in freshbuild with debounce and locking to optimize build check execution.

---

# Task Brief: Implement verification summary output in Markdown and JSON

## Objective

Write verification summary outputs in Markdown and JSON formats for PR proof-of-work artifacts

## Repository

freshbuild

## Suggested Branch

agent/implement-verification-summary-output-in-markdown-and-json

## Task Type

feature

## Risk Level

Medium

## Context

Source: llm (openai:gpt-4.1-mini)

V1 scope requires emitting proof-of-work artifacts as verification summaries

## Allowed Paths

- src/output/**

## Forbidden Paths

- src/ci/**
- src/remote/**

## Expected Commits

- Add output module for Markdown and JSON summaries
- Add tests for output formatting

## Verification

- Unit tests for output formatting
- Manual verification of output files

## Stop Conditions

- Verification summaries generated correctly in both Markdown and JSON
- Output matches expected schema

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Implement verification summary output in freshbuild that writes Markdown and JSON proof-of-work artifacts.

---

# Task Brief: Write README with install, quickstart, and safety notes

## Objective

Provide clear documentation including installation, quickstart guide, and safety notes

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

- Add README with install instructions
- Add quickstart guide
- Add safety notes

## Verification

- Manual review of README content
- Check for clarity and completeness

## Stop Conditions

- README covers install, quickstart, and safety notes
- No misleading or missing information

## Review Pack Required

No.

## Human Decision Needed

- None

## Agent Prompt

Write README for freshbuild including installation, quickstart, and safety notes.

---

# Task Brief: Add unit and fixture tests for core parsing and generation behavior

## Objective

Ensure core parsing and generation logic is well tested with unit and fixture tests

## Repository

freshbuild

## Suggested Branch

agent/add-unit-and-fixture-tests-for-core-parsing-and-generation-behavior

## Task Type

test

## Risk Level

Low

## Context

Source: llm (openai:gpt-4.1-mini)

Verification requires unit or fixture tests for core parsing/generation behavior

## Allowed Paths

- tests/**
- src/**

## Forbidden Paths

- src/ci/**
- src/remote/**

## Expected Commits

- Add unit tests for parsing
- Add fixture tests for generation

## Verification

- Test coverage reports
- Passing test suite

## Stop Conditions

- Core parsing and generation logic fully covered by tests
- No test failures

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Add comprehensive unit and fixture tests for freshbuild core parsing and generation behavior.

---

# Task Brief: Document local-first behavior and security guarantees

## Objective

Document that freshbuild operates local-first with no hidden network, credential, or publish behavior

## Repository

freshbuild

## Suggested Branch

agent/document-local-first-behavior-and-security-guarantees

## Task Type

documentation

## Risk Level

Low

## Context

Source: llm (openai:gpt-4.1-mini)

Verification requires clear documentation of local-first behavior and security guarantees

## Allowed Paths

- docs/**
- README.md

## Forbidden Paths

- src/ci/**
- src/remote/**

## Expected Commits

- Add local-first behavior documentation
- Add security and privacy notes

## Verification

- Manual review of documentation
- Security audit confirmation

## Stop Conditions

- Documentation clearly states local-first behavior
- No hidden network or credential usage

## Review Pack Required

No.

## Human Decision Needed

- None

## Agent Prompt

Document freshbuild's local-first behavior and security guarantees with no hidden network or credential usage.
