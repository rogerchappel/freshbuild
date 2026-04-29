# Orchestration Handoff

## Summary

- Workspace: default
- Repository: freshbuild
- Source: taskbrief + llm-orchestration (openai:gpt-4.1-mini)
- Total tasks: 7
- Dispatch now: freshbuild-implement-package-manager-and-build-script-detection
- Blocked tasks: freshbuild-implement-targeted-check-runner-with-debounce-and-locking

## Dispatch Prompt

Dispatch Wave 1 first. These tasks may run concurrently:
- freshbuild-implement-package-manager-and-build-script-detection
Wait for the whole wave to finish and pass verification before dispatching the next sequential wave.

## LLM Refinement Notes

- The foundational task 'freshbuild-implement-package-manager-and-build-script-detection' must run first as all other tasks depend on it.
- The implementation tasks 'freshbuild-implement-file-watcher-for-changed-files' and 'freshbuild-implement-targeted-check-runner-with-debounce-and-locking' depend on the foundation and can run concurrently as they do not depend on each other but share the same prerequisite.
- Verification tasks depend on all implementation tasks and can run concurrently since they test different aspects and can be parallelized.
- Documentation tasks depend on all verification tasks and can run concurrently as they are independent documentation efforts.
- The high-risk task 'freshbuild-implement-targeted-check-runner-with-debounce-and-locking' is placed in the implementation wave and should be blocked externally until approved, as indicated by the original blocked_by note.

## Sequential Waves

### Wave 1: Foundation setup

- Mode inside wave: sequential
- Dispatch: now
- Tasks: freshbuild-implement-package-manager-and-build-script-detection

### Wave 2: Implementation core features

- Mode inside wave: concurrent
- Dispatch: after_dependencies
- Tasks: freshbuild-implement-file-watcher-for-changed-files

### Wave 3: Verification tests and summary

- Mode inside wave: concurrent
- Dispatch: after_dependencies
- Tasks: freshbuild-implement-verification-summary-output-in-markdown-and-json, freshbuild-add-unit-and-fixture-tests-for-core-parsing-and-generation-behavior

### Wave 4: Documentation and examples

- Mode inside wave: concurrent
- Dispatch: after_dependencies
- Tasks: freshbuild-write-readme-with-install-quickstart-and-safety-notes, freshbuild-document-local-first-behavior-and-security-guarantees

## Task Dependencies

### freshbuild-implement-package-manager-and-build-script-detection: Implement package manager and build script detection

- Phase: foundation
- Repo: freshbuild
- Branch: agent/implement-package-manager-and-build-script-detection
- Risk: medium
- Depends on: None
- Can run concurrently with: None
- Dispatchable now: Yes
- Blocked by: None

### freshbuild-implement-file-watcher-for-changed-files: Implement file watcher for changed files

- Phase: implementation
- Repo: freshbuild
- Branch: agent/implement-file-watcher-for-changed-files
- Risk: medium
- Depends on: freshbuild-implement-package-manager-and-build-script-detection
- Can run concurrently with: freshbuild-implement-targeted-check-runner-with-debounce-and-locking
- Dispatchable now: No
- Blocked by: None

### freshbuild-implement-targeted-check-runner-with-debounce-and-locking: Implement targeted check runner with debounce and locking

- Phase: implementation
- Repo: freshbuild
- Branch: agent/implement-targeted-check-runner-with-debounce-and-locking
- Risk: high
- Depends on: freshbuild-implement-package-manager-and-build-script-detection
- Can run concurrently with: freshbuild-implement-file-watcher-for-changed-files
- Dispatchable now: No
- Blocked by: approve high-risk scope before dispatch

### freshbuild-implement-verification-summary-output-in-markdown-and-json: Implement verification summary output in Markdown and JSON

- Phase: verification
- Repo: freshbuild
- Branch: agent/implement-verification-summary-output-in-markdown-and-json
- Risk: medium
- Depends on: freshbuild-implement-package-manager-and-build-script-detection, freshbuild-implement-file-watcher-for-changed-files, freshbuild-implement-targeted-check-runner-with-debounce-and-locking
- Can run concurrently with: freshbuild-add-unit-and-fixture-tests-for-core-parsing-and-generation-behavior
- Dispatchable now: No
- Blocked by: None

### freshbuild-add-unit-and-fixture-tests-for-core-parsing-and-generation-behavior: Add unit and fixture tests for core parsing and generation behavior

- Phase: verification
- Repo: freshbuild
- Branch: agent/add-unit-and-fixture-tests-for-core-parsing-and-generation-behavior
- Risk: low
- Depends on: freshbuild-implement-package-manager-and-build-script-detection, freshbuild-implement-file-watcher-for-changed-files, freshbuild-implement-targeted-check-runner-with-debounce-and-locking
- Can run concurrently with: freshbuild-implement-verification-summary-output-in-markdown-and-json
- Dispatchable now: No
- Blocked by: None

### freshbuild-write-readme-with-install-quickstart-and-safety-notes: Write README with install, quickstart, and safety notes

- Phase: documentation
- Repo: freshbuild
- Branch: agent/write-readme-with-install-quickstart-and-safety-notes
- Risk: low
- Depends on: freshbuild-implement-package-manager-and-build-script-detection, freshbuild-implement-file-watcher-for-changed-files, freshbuild-implement-targeted-check-runner-with-debounce-and-locking, freshbuild-implement-verification-summary-output-in-markdown-and-json, freshbuild-add-unit-and-fixture-tests-for-core-parsing-and-generation-behavior
- Can run concurrently with: freshbuild-document-local-first-behavior-and-security-guarantees
- Dispatchable now: No
- Blocked by: None

### freshbuild-document-local-first-behavior-and-security-guarantees: Document local-first behavior and security guarantees

- Phase: documentation
- Repo: freshbuild
- Branch: agent/document-local-first-behavior-and-security-guarantees
- Risk: low
- Depends on: freshbuild-implement-package-manager-and-build-script-detection, freshbuild-implement-file-watcher-for-changed-files, freshbuild-implement-targeted-check-runner-with-debounce-and-locking, freshbuild-implement-verification-summary-output-in-markdown-and-json, freshbuild-add-unit-and-fixture-tests-for-core-parsing-and-generation-behavior
- Can run concurrently with: freshbuild-write-readme-with-install-quickstart-and-safety-notes
- Dispatchable now: No
- Blocked by: None

