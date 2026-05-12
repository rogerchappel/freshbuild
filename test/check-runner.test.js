import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'node:path';
import { mkdtemp, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { planChecks, runChecks, validateCheckSafety, loadFreshbuildConfig } from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) => path.join(__dirname, 'fixtures', name);

describe('planChecks', () => {
  it('selects smallest useful checks from changed source files', async () => {
    const plan = await planChecks(fixture('smoke-project'), { changedFiles: ['src/index.js'] });
    assert.deepEqual(plan.checks.map((check) => check.name), ['check', 'test', 'build']);
    assert.deepEqual(plan.changedFiles, ['src/index.js']);
  });

  it('selects docs checks for markdown-only changes when available', async () => {
    const plan = await planChecks(fixture('yarn-package-manager'), { changedFiles: ['README.md'] });
    assert.deepEqual(plan.checks.map((check) => check.name), ['check']);
  });

  it('loads .freshbuild.json defaults for changed files and allowed categories', async () => {
    const plan = await planChecks(fixture('config-project'));
    assert.equal(path.basename(plan.configPath), '.freshbuild.json');
    assert.deepEqual(plan.changedFiles, ['README.md']);
    assert.deepEqual(plan.checks.map((check) => check.name), ['check']);
  });

  it('lets explicit changed files override config defaults', async () => {
    const plan = await planChecks(fixture('config-project'), { changedFiles: ['src/index.js'] });
    assert.deepEqual(plan.changedFiles, ['src/index.js']);
  });
});

describe('loadFreshbuildConfig', () => {
  it('returns normalized config from .freshbuild.json', async () => {
    const loaded = await loadFreshbuildConfig(fixture('config-project'));
    assert.equal(path.basename(loaded.path), '.freshbuild.json');
    assert.deepEqual(loaded.config.allowCategories, ['check']);
    assert.equal(loaded.config.outputDirectory, '.freshbuild/configured');
  });
});

describe('validateCheckSafety', () => {
  it('rejects shell control tokens by default', () => {
    const result = validateCheckSafety({ name: 'test', packageManager: 'npm', command: 'node ok.js && curl example.com', runCommand: ['npm', 'run', 'test'] });
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /shell control tokens/);
  });
});

describe('runChecks', () => {
  it('runs allowlisted checks and writes proof artifacts', async () => {
    const outputDirectory = await mkdtemp(path.join(tmpdir(), 'freshbuild-'));
    try {
      const result = await runChecks(fixture('smoke-project'), { changedFiles: ['src/index.js'], outputDirectory, timeoutMs: 30_000 });
      assert.equal(result.status, 'passed');
      assert.equal(result.checks.length, 3);
      const markdown = await readFile(path.join(outputDirectory, 'verification-summary.md'), 'utf8');
      assert.match(markdown, /freshbuild Verification Summary/);
      assert.match(markdown, /src\/index.js/);
    } finally {
      await rm(outputDirectory, { recursive: true, force: true });
    }
  });

  it('uses configured proof output directory when one is present', async () => {
    const projectRoot = fixture('config-project');
    const outputDirectory = path.join(projectRoot, '.freshbuild', 'configured');
    try {
      const result = await runChecks(projectRoot, { dryRun: true });
      assert.equal(result.status, 'passed');
      await access(path.join(outputDirectory, 'verification-summary.md'));
    } finally {
      await rm(path.join(projectRoot, '.freshbuild'), { recursive: true, force: true });
    }
  });
});
