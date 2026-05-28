import { spawn } from "node:child_process";
import type { BuildPlan, CommandResult } from "./types.js";

export function commandForScript(packageManager: string, script: string): string[] {
  switch (packageManager) {
    case "npm":
      return ["npm", "run", script];
    case "pnpm":
      return ["pnpm", script];
    case "yarn":
      return ["yarn", script];
    case "bun":
      return ["bun", "run", script];
    default:
      throw new Error(`Unsupported package manager: ${packageManager}`);
  }
}

export async function runPlan(plan: BuildPlan): Promise<CommandResult[]> {
  const results: CommandResult[] = [];

  for (const script of plan.scripts) {
    const command = commandForScript(plan.packageManager, script);
    results.push(await runCommand(plan.root, script, command));
    if (results[results.length - 1]?.exitCode !== 0) break;
  }

  return results;
}

function runCommand(cwd: string, script: string, command: string[]): Promise<CommandResult> {
  const started = Date.now();

  return new Promise((resolve) => {
    const child = spawn(command[0]!, command.slice(1), {
      cwd,
      env: process.env,
      shell: false
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
      process.stdout.write(chunk);
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
      process.stderr.write(chunk);
    });

    child.on("error", (error) => {
      stderr += `${error.message}\n`;
      resolve({
        script,
        command,
        exitCode: 1,
        durationMs: Date.now() - started,
        stdout,
        stderr
      });
    });

    child.on("close", (exitCode) => {
      resolve({
        script,
        command,
        exitCode,
        durationMs: Date.now() - started,
        stdout,
        stderr
      });
    });
  });
}
