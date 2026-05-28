import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PackageInfo, PackageManager } from "./types.js";

interface PackageJson {
  name?: string;
  packageManager?: string;
  scripts?: Record<string, string>;
}

const managers: PackageManager[] = ["pnpm", "npm", "yarn", "bun"];

export function detectPackageManager(root: string): PackageManager {
  const packageJson = readPackageJson(root);
  const declared = packageJson.packageManager?.split("@")[0];
  if (declared && managers.includes(declared as PackageManager)) {
    return declared as PackageManager;
  }

  if (existsSync(join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(root, "package-lock.json"))) return "npm";
  if (existsSync(join(root, "yarn.lock"))) return "yarn";
  if (existsSync(join(root, "bun.lockb")) || existsSync(join(root, "bun.lock"))) return "bun";

  return "npm";
}

export function readPackageInfo(root: string): PackageInfo {
  const packageJson = readPackageJson(root);
  return {
    root,
    packageManager: detectPackageManager(root),
    packageName: packageJson.name ?? "unknown",
    scripts: packageJson.scripts ?? {}
  };
}

function readPackageJson(root: string): PackageJson {
  const path = join(root, "package.json");
  if (!existsSync(path)) {
    throw new Error(`No package.json found at ${path}`);
  }

  return JSON.parse(readFileSync(path, "utf8")) as PackageJson;
}
