import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  detectBuildScripts,
  detectPackageManager,
  parsePackageManagerField
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) => path.join(__dirname, 'fixtures', name);

describe('parsePackageManagerField', () => {
  it('parses supported packageManager values', () => {
    assert.deepEqual(parsePackageManagerField('pnpm@9.12.0'), {
      name: 'pnpm',
      version: '9.12.0',
      raw: 'pnpm@9.12.0'
    });
    assert.equal(parsePackageManagerField('unsupported@1.0.0'), null);
    assert.equal(parsePackageManagerField(''), null);
  });
});

describe('detectPackageManager', () => {
  it('detects npm from package-lock.json', async () => {
    const result = await detectPackageManager(fixture('npm-project'));
    assert.equal(result.packageManager, 'npm');
    assert.equal(result.source, 'lockfile');
    assert.deepEqual(result.lockfiles, [{ file: 'package-lock.json', packageManager: 'npm' }]);
  });

  it('prefers packageManager field while keeping lockfile evidence', async () => {
    const result = await detectPackageManager(fixture('pnpm-project'));
    assert.equal(result.packageManager, 'pnpm');
    assert.equal(result.version, '9.12.0');
    assert.equal(result.source, 'package.json#packageManager');
    assert.deepEqual(result.lockfiles, [{ file: 'pnpm-lock.yaml', packageManager: 'pnpm' }]);
  });

  it('detects yarn from packageManager field without lockfile', async () => {
    const result = await detectPackageManager(fixture('yarn-package-manager'));
    assert.equal(result.packageManager, 'yarn');
    assert.equal(result.version, '4.1.1');
    assert.deepEqual(result.lockfiles, []);
  });

  it('detects bun from binary lockfile', async () => {
    const result = await detectPackageManager(fixture('bun-project'));
    assert.equal(result.packageManager, 'bun');
    assert.deepEqual(result.lockfiles, [{ file: 'bun.lockb', packageManager: 'bun' }]);
  });

  it('reports no package manager when no package metadata exists', async () => {
    const result = await detectPackageManager(fixture('no-package-json'));
    assert.equal(result.packageManager, null);
    assert.equal(result.hasPackageJson, false);
    assert.deepEqual(result.evidence, []);
  });

  it('warns on conflicting package manager evidence', async () => {
    const result = await detectPackageManager(fixture('mixed-lockfiles'));
    assert.equal(result.packageManager, 'npm');
    assert.match(result.warnings.join('\n'), /Conflicting package manager evidence/);
    assert.equal(result.lockfiles.length, 2);
  });
});

describe('detectBuildScripts', () => {
  it('returns categorized npm scripts with runnable command arrays', async () => {
    const result = await detectBuildScripts(fixture('npm-project'));
    assert.equal(result.packageManager, 'npm');
    assert.deepEqual(result.scripts.map((script) => script.name), ['build', 'lint', 'test']);
    assert.deepEqual(result.scriptsByCategory.build.map((script) => script.name), ['build']);
    assert.deepEqual(result.scriptsByCategory.test.map((script) => script.name), ['test']);
    assert.deepEqual(result.scriptsByCategory.lint.map((script) => script.name), ['lint']);
    assert.deepEqual(result.scripts.find((script) => script.name === 'test').runCommand, ['npm', 'run', 'test']);
  });

  it('categorizes script families with deterministic preference order', async () => {
    const result = await detectBuildScripts(fixture('pnpm-project'));
    assert.deepEqual(result.scriptsByCategory.build.map((script) => script.name), ['build:app']);
    assert.deepEqual(result.scriptsByCategory.test.map((script) => script.name), ['test', 'test:unit']);
    assert.deepEqual(result.scriptsByCategory.typecheck.map((script) => script.name), ['typecheck']);
    assert.deepEqual(result.scripts.find((script) => script.name === 'build:app').runCommand, ['pnpm', 'run', 'build:app']);
  });

  it('returns an empty script list when package.json is absent', async () => {
    const result = await detectBuildScripts(fixture('no-package-json'));
    assert.equal(result.hasPackageJson, false);
    assert.deepEqual(result.scripts, []);
    assert.deepEqual(result.scriptsByCategory, {});
  });
});
