#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { planChecks, runChecks } from './index.js';

const USAGE = `freshbuild — local-first check planner and proof runner

Usage:
  freshbuild plan [--root DIR] [--changed a,b] [--config FILE]
  freshbuild run  [--root DIR] [--changed a,b] [--config FILE] [--dry-run] [--output DIR] [--timeout MS]
  freshbuild once [same options as run]

Options:
  --root DIR       Project root to inspect (default: current directory)
  --changed a,b    Comma-separated changed files used to select checks
  --config FILE    Read defaults from a JSON config file (default: .freshbuild.json)
  --dry-run        Plan and record checks without running package scripts
  --output DIR     Directory for verification-summary.md/json
  --timeout MS     Per-check timeout in milliseconds
  --no-summary     Do not write verification summary files
  -h, --help       Show this help
  -v, --version    Show package version
`;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '-h') { args.help = true; continue; }
    if (arg === '-v') { args.version = true; continue; }
    if (!arg.startsWith('--')) { args._.push(arg); continue; }
    const key = arg.slice(2);
    if (key === 'dry-run' || key === 'json' || key === 'no-summary' || key === 'help' || key === 'version') args[key] = true;
    else {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for --${key}`);
      args[key] = value;
    }
  }
  return args;
}

async function readVersion() {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  return packageJson.version;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] ?? 'plan';
  const root = args.root ?? process.cwd();
  const changedFiles = args.changed ? args.changed.split(',').map((item) => item.trim()).filter(Boolean) : [];

  if (args.help) {
    console.log(USAGE);
    return;
  }

  if (args.version) {
    console.log(await readVersion());
    return;
  }

  if (command === 'plan') {
    const plan = await planChecks(root, { changedFiles, configPath: args.config });
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  if (command === 'run' || command === 'once') {
    const result = await runChecks(root, {
      changedFiles,
      configPath: args.config,
      dryRun: Boolean(args['dry-run']),
      outputDirectory: args.output,
      timeoutMs: args.timeout ? Number(args.timeout) : undefined,
      writeSummary: args['no-summary'] ? false : undefined
    });
    console.log(JSON.stringify({ status: result.status, artifacts: result.artifacts, checks: result.checks, warnings: result.warnings }, null, 2));
    process.exitCode = result.status === 'failed' ? 1 : 0;
    return;
  }

  console.error(USAGE);
  process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
