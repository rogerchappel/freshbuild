import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { BuildPlan, CommandResult, VerificationSummary } from "./types.js";

export function buildSummary(plan: BuildPlan, results: CommandResult[]): VerificationSummary {
  const status = results.length === 0
    ? "skipped"
    : results.every((result) => result.exitCode === 0)
      ? "passed"
      : "failed";

  return {
    generatedAt: new Date().toISOString(),
    root: plan.root,
    packageManager: plan.packageManager,
    changedFiles: plan.changedFiles,
    status,
    reason: plan.reason,
    results
  };
}

export function writeProof(outDir: string, summary: VerificationSummary): void {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "verification.json"), `${JSON.stringify(summary, null, 2)}\n`);
  writeFileSync(join(outDir, "verification.md"), renderMarkdown(summary));
}

export function renderMarkdown(summary: VerificationSummary): string {
  const commands = summary.results.length === 0
    ? "- No commands were run.\n"
    : summary.results.map((result) => {
      const command = result.command.join(" ");
      return `- ${result.exitCode === 0 ? "PASS" : "FAIL"} \`${command}\` (${result.durationMs}ms)`;
    }).join("\n");

  const changed = summary.changedFiles.length === 0
    ? "None supplied"
    : summary.changedFiles.map((file) => `- \`${file}\``).join("\n");

  return `# freshbuild Verification

- Status: ${summary.status}
- Generated: ${summary.generatedAt}
- Package manager: ${summary.packageManager}
- Reason: ${summary.reason}

## Commands

${commands}

## Changed Files

${changed}
`;
}
