#!/usr/bin/env node
import { planChecks, runChecks } from './index.js';

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) { args._.push(arg); continue; }
    const key = arg.slice(2);
    if (key === 'dry-run' || key === 'json' || key === 'no-summary') args[key] = true;
    else args[key] = argv[++i];
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] ?? 'plan';
  const root = args.root ?? process.cwd();
  const changedFiles = args.changed ? args.changed.split(',').map((item) => item.trim()).filter(Boolean) : [];

  if (command === 'plan') {
    const plan = await planChecks(root, { changedFiles });
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  if (command === 'run' || command === 'once') {
    const result = await runChecks(root, {
      changedFiles,
      dryRun: Boolean(args['dry-run']),
      outputDirectory: args.output,
      timeoutMs: args.timeout ? Number(args.timeout) : undefined,
      writeSummary: !args['no-summary']
    });
    console.log(JSON.stringify({ status: result.status, artifacts: result.artifacts, checks: result.checks, warnings: result.warnings }, null, 2));
    process.exitCode = result.status === 'failed' ? 1 : 0;
    return;
  }

  console.error('Usage: freshbuild <plan|run|once> [--root DIR] [--changed a,b] [--dry-run] [--output DIR] [--timeout MS]');
  process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
