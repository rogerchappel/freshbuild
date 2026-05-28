# Security Policy

## Supported Versions

| Version | Supported |
| --- | --- |
| 0.1.x | Yes, after the first public release |
| < 0.1.0 | No |

`freshbuild` is currently in release-candidate form. Security-sensitive users should review the package scripts in their own repositories before running local checks.

## Reporting a Vulnerability

Please do not report suspected vulnerabilities in public issues, pull requests, or discussions.

Ask maintainers for the private security reporting path before sharing details.

If no private reporting path exists yet, ask maintainers through public project channels for a private reporting path. Do not include exploit details, secrets, personal data, or sensitive technical details in public messages.

## What to Include

When a private reporting path is available, include:

- A clear description of the issue.
- Affected versions, files, packages, workflows, or configuration.
- Steps to reproduce, proof of concept, or attack scenario when safe to share.
- Potential impact.
- Suggested mitigation, if known.

## Response Expectations

Maintainers review good-faith reports as capacity allows.

Do not imply paid support, guaranteed response times, guaranteed fixes, or service-level agreements unless `freshbuild` explicitly provides them.

## Scope

In scope:

- Vulnerabilities in freshbuild.
- Insecure default configuration shipped by this project.
- Unsafe command execution behavior in the CLI.
- CI, release, or dependency guidance maintained by this project.

Out of scope:

- General support requests.
- Requests for guaranteed maintenance timelines.
- Issues in unrelated downstream projects.

## Disclosure

Coordinate disclosure with maintainers before publishing vulnerability details.
