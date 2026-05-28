export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export interface PackageInfo {
  root: string;
  packageManager: PackageManager;
  packageName: string;
  scripts: Record<string, string>;
}

export interface PlanOptions {
  requestedScripts?: string[];
  changedFiles?: string[];
  allowedScripts?: string[];
}

export interface BuildPlan {
  root: string;
  packageManager: PackageManager;
  scripts: string[];
  changedFiles: string[];
  reason: string;
}

export interface CommandResult {
  script: string;
  command: string[];
  exitCode: number | null;
  durationMs: number;
  stdout: string;
  stderr: string;
}

export interface VerificationSummary {
  generatedAt: string;
  root: string;
  packageManager: PackageManager;
  changedFiles: string[];
  status: "passed" | "failed" | "skipped";
  reason: string;
  results: CommandResult[];
}
