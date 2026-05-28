#!/usr/bin/env node
import { resolve } from "node:path";
import process from "node:process";
import chokidar from "chokidar";
import { Command } from "commander";
import { createPlan } from "./planner.js";
import { buildSummary, writeProof } from "./proof.js";
import { readPackageInfo } from "./package-info.js";
import { runPlan } from "./runner.js";

interface RunOptions {
  root?: string;
  changed?: string[];
  script?: string[];
  allow?: string[];
  out?: string;
  dryRun?: boolean;
}

const program = new Command();

program
  .name("freshbuild")
  .description("Local-first build watcher and verification proof generator.")
  .version("0.1.0");

program
  .command("run")
  .description("Run the smallest useful safe checks once and write proof artifacts.")
  .option("-r, --root <path>", "repository root", process.cwd())
  .option("-c, --changed <path>", "changed file path; repeatable", collect, [])
  .option("-s, --script <name>", "safe package script to run; repeatable", collect, [])
  .option("--allow <name>", "override allowed script name; repeatable", collect, [])
  .option("-o, --out <path>", "proof output directory", ".freshbuild")
  .option("--dry-run", "write the planned proof without executing commands")
  .action(async (options: RunOptions) => {
    const exitCode = await runOnce(options);
    process.exitCode = exitCode;
  });

program
  .command("watch")
  .description("Watch local files, debounce changes, run safe checks, and update proof artifacts.")
  .option("-r, --root <path>", "repository root", process.cwd())
  .option("-s, --script <name>", "safe package script to run; repeatable", collect, [])
  .option("--allow <name>", "override allowed script name; repeatable", collect, [])
  .option("-o, --out <path>", "proof output directory", ".freshbuild")
  .option("-d, --debounce <ms>", "debounce delay in milliseconds", "500")
  .action((options: RunOptions & { debounce: string }) => {
    watch(options);
  });

program.parse();

async function runOnce(options: RunOptions): Promise<number> {
  const root = resolve(options.root ?? process.cwd());
  const out = resolve(root, options.out ?? ".freshbuild");
  const packageInfo = readPackageInfo(root);
  const plan = createPlan(packageInfo, {
    requestedScripts: options.script,
    changedFiles: options.changed,
    allowedScripts: options.allow && options.allow.length > 0 ? options.allow : undefined
  });

  const results = options.dryRun ? [] : await runPlan(plan);
  const summary = buildSummary(plan, results);
  writeProof(out, summary);

  if (summary.status === "failed") return 1;
  if (summary.status === "skipped") return 2;
  return 0;
}

function watch(options: RunOptions & { debounce: string }): void {
  const root = resolve(options.root ?? process.cwd());
  const debounceMs = Number.parseInt(options.debounce, 10);
  const changed = new Set<string>();
  let timer: NodeJS.Timeout | undefined;
  let running = false;
  let queued = false;

  const trigger = (path: string) => {
    if (path.includes("node_modules") || path.includes(".git") || path.includes(".freshbuild")) return;
    changed.add(path);
    if (timer) clearTimeout(timer);
    timer = setTimeout(runQueued, Number.isFinite(debounceMs) ? debounceMs : 500);
  };

  const runQueued = async () => {
    if (running) {
      queued = true;
      return;
    }

    running = true;
    const changedFiles = [...changed];
    changed.clear();
    const exitCode = await runOnce({ ...options, root, changed: changedFiles });
    if (exitCode === 1) process.stderr.write("freshbuild: checks failed\n");
    running = false;

    if (queued) {
      queued = false;
      await runQueued();
    }
  };

  chokidar
    .watch(["."], {
      cwd: root,
      ignoreInitial: true,
      ignored: ["**/node_modules/**", "**/.git/**", "**/.freshbuild/**", "**/dist/**"]
    })
    .on("add", trigger)
    .on("change", trigger)
    .on("unlink", trigger);

  process.stdout.write(`freshbuild watching ${root}\n`);
}

function collect(value: string, previous: string[]): string[] {
  previous.push(value);
  return previous;
}
