import type { BuildPlan, PackageInfo, PlanOptions } from "./types.js";

export const defaultAllowedScripts = [
  "check",
  "typecheck",
  "lint",
  "test",
  "build",
  "smoke"
];

const preferredOrder = ["check", "typecheck", "lint", "test", "build", "smoke"];

export function createPlan(packageInfo: PackageInfo, options: PlanOptions = {}): BuildPlan {
  const allowed = new Set(options.allowedScripts ?? defaultAllowedScripts);
  const available = Object.keys(packageInfo.scripts).filter((script) => allowed.has(script));
  const changedFiles = normalizeChangedFiles(options.changedFiles ?? []);
  const requested = options.requestedScripts ?? [];

  const requestedScripts = requested.filter((script) => {
    return available.includes(script);
  });

  if (requested.length > 0 && requestedScripts.length === 0) {
    return {
      root: packageInfo.root,
      packageManager: packageInfo.packageManager,
      scripts: [],
      changedFiles,
      reason: `No requested scripts are available in the allowlist: ${requested.join(", ")}`
    };
  }

  const scripts = requestedScripts.length > 0
    ? requestedScripts
    : chooseScripts(available, changedFiles);

  return {
    root: packageInfo.root,
    packageManager: packageInfo.packageManager,
    scripts,
    changedFiles,
    reason: explainPlan(scripts, changedFiles)
  };
}

function chooseScripts(available: string[], changedFiles: string[]): string[] {
  if (available.length === 0) return [];

  const ordered = preferredOrder.filter((script) => available.includes(script));
  if (changedFiles.length === 0) return takeCore(ordered);

  const docsOnly = changedFiles.every((file) => {
    return file.endsWith(".md") || file.startsWith("docs/") || file.startsWith(".github/");
  });

  if (docsOnly) {
    return ordered.filter((script) => ["check", "lint", "test"].includes(script)).slice(0, 2);
  }

  const testsChanged = changedFiles.some((file) => {
    return file.startsWith("test/") || file.startsWith("tests/") || file.includes(".test.");
  });

  if (testsChanged) {
    return ordered.filter((script) => ["check", "typecheck", "test"].includes(script));
  }

  return takeCore(ordered);
}

function takeCore(ordered: string[]): string[] {
  const core = ordered.filter((script) => ["check", "typecheck", "test"].includes(script));
  return core.length > 0 ? core : ordered.slice(0, 2);
}

function normalizeChangedFiles(files: string[]): string[] {
  return [...new Set(files.map((file) => file.trim()).filter(Boolean))].sort();
}

function explainPlan(scripts: string[], changedFiles: string[]): string {
  if (scripts.length === 0) return "No safe package scripts were detected.";
  if (changedFiles.length === 0) return "No changed files were supplied; running core safe checks.";
  return "Selected safe package scripts from changed file categories.";
}
