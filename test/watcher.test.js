import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import {
  ProjectFileWatcher,
  diffFileSnapshots,
  snapshotProjectFiles,
  watchProjectFiles
} from '../src/index.js';

const tempRoots = [];

async function makeTempProject() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'freshbuild-watcher-'));
  tempRoots.push(root);
  return root;
}

async function waitFor(predicate, timeoutMs = 1000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert.fail('timed out waiting for watcher change notification');
}

async function writeChangedFile(filePath, contents) {
  await writeFile(filePath, contents);
  const now = new Date(Date.now() + 1000);
  await import('node:fs/promises').then(({ utimes }) => utimes(filePath, now, now));
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('snapshotProjectFiles', () => {
  it('returns sorted project-relative files while ignoring noisy directories', async () => {
    const root = await makeTempProject();
    await mkdir(path.join(root, 'src'), { recursive: true });
    await mkdir(path.join(root, 'node_modules', 'dependency'), { recursive: true });
    await mkdir(path.join(root, '.git'), { recursive: true });
    await writeFile(path.join(root, 'src', 'index.js'), 'console.log("hi");\n');
    await writeFile(path.join(root, 'README.md'), '# Project\n');
    await writeFile(path.join(root, 'node_modules', 'dependency', 'index.js'), 'ignored\n');
    await writeFile(path.join(root, '.git', 'HEAD'), 'ignored\n');

    const snapshot = await snapshotProjectFiles(root);

    assert.deepEqual([...snapshot.keys()], ['README.md', 'src/index.js']);
    assert.equal(snapshot.get('src/index.js').absolutePath, path.join(root, 'src', 'index.js'));
  });

  it('supports additional ignored directories', async () => {
    const root = await makeTempProject();
    await mkdir(path.join(root, 'tmp'), { recursive: true });
    await writeFile(path.join(root, 'tmp', 'generated.txt'), 'ignored\n');
    await writeFile(path.join(root, 'tracked.txt'), 'tracked\n');

    const snapshot = await snapshotProjectFiles(root, { ignoredDirectories: ['tmp'] });

    assert.deepEqual([...snapshot.keys()], ['tracked.txt']);
  });
});

describe('diffFileSnapshots', () => {
  it('reports created, modified, and deleted files deterministically', () => {
    const previous = new Map([
      ['deleted.txt', { relativePath: 'deleted.txt', absolutePath: '/project/deleted.txt', size: 1, mtimeMs: 1 }],
      ['modified.txt', { relativePath: 'modified.txt', absolutePath: '/project/modified.txt', size: 1, mtimeMs: 1 }],
      ['same.txt', { relativePath: 'same.txt', absolutePath: '/project/same.txt', size: 1, mtimeMs: 1 }]
    ]);
    const next = new Map([
      ['created.txt', { relativePath: 'created.txt', absolutePath: '/project/created.txt', size: 1, mtimeMs: 1 }],
      ['modified.txt', { relativePath: 'modified.txt', absolutePath: '/project/modified.txt', size: 2, mtimeMs: 2 }],
      ['same.txt', { relativePath: 'same.txt', absolutePath: '/project/same.txt', size: 1, mtimeMs: 1 }]
    ]);

    assert.deepEqual(diffFileSnapshots(previous, next), [
      { type: 'created', relativePath: 'created.txt', absolutePath: '/project/created.txt' },
      { type: 'deleted', relativePath: 'deleted.txt', absolutePath: '/project/deleted.txt' },
      { type: 'modified', relativePath: 'modified.txt', absolutePath: '/project/modified.txt' }
    ]);
  });
});

describe('ProjectFileWatcher', () => {
  it('reports file changes when scan is called manually', async () => {
    const root = await makeTempProject();
    await writeFile(path.join(root, 'existing.txt'), 'before\n');
    const events = [];
    const watcher = new ProjectFileWatcher(root, {
      onChange: (event) => events.push(event)
    });

    await watcher.start();
    await writeChangedFile(path.join(root, 'existing.txt'), 'after\n');
    await writeFile(path.join(root, 'created.txt'), 'new\n');
    await unlink(path.join(root, 'existing.txt'));

    const changes = await watcher.scan();
    await watcher.stop();

    assert.deepEqual(changes.map((change) => `${change.type}:${change.relativePath}`), [
      'created:created.txt',
      'deleted:existing.txt'
    ]);
    assert.equal(events.length, 1);
    assert.deepEqual(events[0].changedFiles, ['created.txt', 'existing.txt']);
  });

  it('polls for changes and calls onChange with a batch of changed files', async () => {
    const root = await makeTempProject();
    await writeFile(path.join(root, 'app.js'), 'before\n');
    const events = [];
    const watcher = watchProjectFiles(root, {
      intervalMs: 25,
      onChange: (event) => events.push(event)
    });

    await watcher.start();
    await writeChangedFile(path.join(root, 'app.js'), 'after\n');

    await waitFor(() => events.length > 0);
    await watcher.stop();

    assert.equal(watcher.running, false);
    assert.deepEqual(events[0].changedFiles, ['app.js']);
    assert.equal(events[0].changes[0].type, 'modified');
  });
});
