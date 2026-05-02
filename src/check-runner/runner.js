import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { planChecks } from './planner.js';
import { validateCheckSafety } from './safety.js';
import { writeVerificationSummary } from '../output/index.js';

function commandToString(command) {
  return Array.isArray(command) ? command.join(' ') : '';
}

function runSpawn(command, options = {}) {
  const started = performance.now();
  const timeoutMs = options.timeoutMs ?? 120_000;

  return new Promise((resolve) => {
    const child = spawn(command[0], command.slice(1), {
      cwd: options.cwd,
      shell: false,
      env: { ...process.env, ...options.env },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeoutMs);
    child.stdout?.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr?.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ status: 'failed', exitCode: null, durationMs: Math.round(performance.now() - started), stdout, stderr: `${stderr}${error.message}\n`, timedOut });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ status: code === 0 && !timedOut ? 'passed' : 'failed', exitCode: code, durationMs: Math.round(performance.now() - started), stdout, stderr, timedOut });
    });
  });
}

export class CheckRunner {
  #running = false;
  #queued = null;

  get running() { return this.#running; }

  async run(projectRoot = process.cwd(), options = {}) {
    if (this.#running) {
      this.#queued = { projectRoot, options };
      return { status: 'queued', checks: [], warnings: ['another run is active; latest request queued'] };
    }

    this.#running = true;
    try {
      const plan = options.plan ?? await planChecks(projectRoot, options);
      const checks = [];
      const warnings = [...(plan.warnings ?? [])];

      for (const check of plan.checks) {
        const safety = validateCheckSafety(check, options.safety ?? {});
        if (!safety.ok) {
          checks.push({ name: check.name, status: 'skipped', command: commandToString(check.runCommand), notes: safety.errors });
          warnings.push(...safety.errors.map((error) => `${check.name}: ${error}`));
          continue;
        }

        if (options.dryRun) {
          checks.push({ name: check.name, status: 'planned', command: commandToString(check.runCommand), notes: [check.reason] });
          continue;
        }

        const result = await runSpawn(check.runCommand, { cwd: plan.projectRoot, timeoutMs: options.timeoutMs, env: options.env });
        checks.push({
          name: check.name,
          status: result.status,
          command: commandToString(check.runCommand),
          durationMs: result.durationMs,
          notes: [
            check.reason,
            `exit code: ${result.exitCode ?? 'n/a'}`,
            result.timedOut ? 'timed out' : null,
            result.stdout.trim() ? `stdout: ${result.stdout.trim().slice(0, 1000)}` : null,
            result.stderr.trim() ? `stderr: ${result.stderr.trim().slice(0, 1000)}` : null
          ].filter(Boolean)
        });
      }

      const overallStatus = checks.some((check) => check.status === 'failed') ? 'failed'
        : checks.some((check) => check.status === 'skipped') ? 'skipped'
          : checks.length ? 'passed' : 'skipped';
      const summary = {
        project: options.projectName ?? 'freshbuild project',
        title: 'freshbuild Verification Summary',
        overallStatus,
        changedFiles: plan.changedFiles,
        checks,
        warnings,
        notes: [`package manager: ${plan.packageManager ?? 'not detected'}`, `categories: ${plan.categories.join(', ') || 'none'}`]
      };
      const artifacts = options.writeSummary === false ? null : await writeVerificationSummary(summary, { outputDirectory: options.outputDirectory ?? '.freshbuild' });
      return { status: overallStatus, plan, checks, summary, artifacts, warnings };
    } finally {
      this.#running = false;
      const queued = this.#queued;
      this.#queued = null;
      if (queued && options.runQueued !== false) {
        void this.run(queued.projectRoot, queued.options);
      }
    }
  }
}

export async function runChecks(projectRoot = process.cwd(), options = {}) {
  return new CheckRunner().run(projectRoot, options);
}
