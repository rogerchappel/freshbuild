import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import {
  createVerificationSummary,
  renderVerificationSummaryJson,
  renderVerificationSummaryMarkdown,
  writeVerificationSummary
} from '../src/index.js';

const tempRoots = [];

const sampleInput = {
  generatedAt: '2026-05-02T00:00:00.000Z',
  project: 'freshbuild',
  title: 'PR Verification',
  overallStatus: 'passed',
  branch: 'agent/example',
  commit: 'abc1234',
  checks: [
    { name: 'unit tests', status: 'passed', command: 'npm test', durationMs: 42 },
    { name: 'manual docs review', status: 'passed', notes: ['README covers safety notes'] }
  ],
  changedFiles: ['src/output/verification-summary.js', 'test/output.test.js'],
  changes: [
    { path: 'src/output/verification-summary.js', status: 'created', description: 'summary renderer' }
  ],
  artifacts: [
    { path: '.freshbuild/verification-summary.md', type: 'markdown', description: 'human-readable proof of work' },
    { path: '.freshbuild/verification-summary.json', type: 'json', description: 'machine-readable proof of work' }
  ],
  warnings: ['targeted runner remains approval-blocked'],
  notes: ['local-only artifact generation']
};

async function makeTempRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'freshbuild-output-'));
  tempRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('createVerificationSummary', () => {
  it('normalizes core parsing input into a stable schema', () => {
    const summary = createVerificationSummary({
      generatedAt: '2026-05-02T00:00:00.000Z',
      checks: [{ name: ' tests ', status: ' passed ', command: ' npm test ' }],
      changedFiles: [' src/index.js ', '', null],
      artifacts: [{ path: ' summary.md ', type: ' markdown ' }]
    });

    assert.equal(summary.schemaVersion, 1);
    assert.equal(summary.project, 'freshbuild');
    assert.equal(summary.overallStatus, 'passed');
    assert.deepEqual(summary.checks[0], {
      name: 'tests',
      status: 'passed',
      command: 'npm test',
      durationMs: null,
      notes: []
    });
    assert.deepEqual(summary.changedFiles, ['src/index.js']);
    assert.deepEqual(summary.artifacts[0], {
      path: 'summary.md',
      type: 'markdown',
      description: ''
    });
  });

  it('defaults the overall status to failed when any check failed', () => {
    const summary = createVerificationSummary({ checks: [{ name: 'test', status: 'failed' }] });
    assert.equal(summary.overallStatus, 'failed');
  });
});

describe('verification summary renderers', () => {
  it('generates deterministic Markdown proof-of-work output', () => {
    const markdown = renderVerificationSummaryMarkdown(sampleInput);

    assert.match(markdown, /^# PR Verification/m);
    assert.match(markdown, /- \*\*Status:\*\* passed/);
    assert.match(markdown, /- \*\*passed\*\* unit tests — `npm test` \(42ms\)/);
    assert.match(markdown, /  - README covers safety notes/);
    assert.match(markdown, /- src\/output\/verification-summary\.js/);
    assert.match(markdown, /- \*\*markdown\*\* `.freshbuild\/verification-summary\.md`/);
    assert.match(markdown, /targeted runner remains approval-blocked/);
  });

  it('generates parseable JSON proof-of-work output', () => {
    const parsed = JSON.parse(renderVerificationSummaryJson(sampleInput));

    assert.equal(parsed.schemaVersion, 1);
    assert.equal(parsed.title, 'PR Verification');
    assert.equal(parsed.checks.length, 2);
    assert.deepEqual(parsed.changedFiles, ['src/output/verification-summary.js', 'test/output.test.js']);
  });

  it('writes Markdown and JSON summaries to an output directory', async () => {
    const root = await makeTempRoot();
    const outputDirectory = path.join(root, '.freshbuild', 'reports');
    await mkdir(root, { recursive: true });

    const result = await writeVerificationSummary(sampleInput, { outputDirectory });
    const [markdown, json] = await Promise.all([
      readFile(result.markdownPath, 'utf8'),
      readFile(result.jsonPath, 'utf8')
    ]);

    assert.equal(result.markdownPath, path.join(outputDirectory, 'verification-summary.md'));
    assert.equal(result.jsonPath, path.join(outputDirectory, 'verification-summary.json'));
    assert.match(markdown, /# PR Verification/);
    assert.equal(JSON.parse(json).project, 'freshbuild');
  });
});
