import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_IGNORED_DIRECTORIES = new Set([
  '.git',
  '.hg',
  '.svn',
  'node_modules',
  '.freshbuild',
  '.turbo',
  '.next',
  'dist',
  'build',
  'coverage'
]);

function toRelativePath(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function normalizeIgnoredDirectories(ignoredDirectories = []) {
  return new Set([...DEFAULT_IGNORED_DIRECTORIES, ...ignoredDirectories].filter(Boolean));
}

function shouldIgnoreEntry(entry, ignoredDirectories) {
  return entry.isDirectory() && ignoredDirectories.has(entry.name);
}

async function walkFiles(root, options = {}) {
  const ignoredDirectories = normalizeIgnoredDirectories(options.ignoredDirectories);
  const files = [];

  async function visit(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error && (error.code === 'ENOENT' || error.code === 'ENOTDIR')) return;
      throw error;
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (shouldIgnoreEntry(entry, ignoredDirectories)) continue;
      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (entry.isFile()) {
        files.push(entryPath);
      }
    }
  }

  await visit(root);
  return files;
}

export async function snapshotProjectFiles(projectRoot = process.cwd(), options = {}) {
  const root = path.resolve(projectRoot);
  const files = await walkFiles(root, options);
  const snapshot = new Map();

  for (const filePath of files) {
    let fileStat;
    try {
      fileStat = await stat(filePath);
    } catch (error) {
      if (error && error.code === 'ENOENT') continue;
      throw error;
    }

    if (!fileStat.isFile()) continue;
    snapshot.set(toRelativePath(root, filePath), {
      relativePath: toRelativePath(root, filePath),
      absolutePath: filePath,
      size: fileStat.size,
      mtimeMs: fileStat.mtimeMs
    });
  }

  return snapshot;
}

export function diffFileSnapshots(previousSnapshot, nextSnapshot) {
  const changes = [];

  for (const [relativePath, nextFile] of nextSnapshot.entries()) {
    const previousFile = previousSnapshot.get(relativePath);
    if (!previousFile) {
      changes.push({ type: 'created', relativePath, absolutePath: nextFile.absolutePath });
      continue;
    }

    if (previousFile.size !== nextFile.size || previousFile.mtimeMs !== nextFile.mtimeMs) {
      changes.push({ type: 'modified', relativePath, absolutePath: nextFile.absolutePath });
    }
  }

  for (const [relativePath, previousFile] of previousSnapshot.entries()) {
    if (!nextSnapshot.has(relativePath)) {
      changes.push({ type: 'deleted', relativePath, absolutePath: previousFile.absolutePath });
    }
  }

  changes.sort((a, b) => a.relativePath.localeCompare(b.relativePath) || a.type.localeCompare(b.type));
  return changes;
}

export class ProjectFileWatcher {
  #projectRoot;
  #options;
  #timer = null;
  #snapshot = new Map();
  #running = false;
  #scanning = false;

  constructor(projectRoot = process.cwd(), options = {}) {
    this.#projectRoot = path.resolve(projectRoot);
    this.#options = {
      intervalMs: 500,
      onChange: null,
      ignoredDirectories: [],
      ...options
    };
  }

  get projectRoot() {
    return this.#projectRoot;
  }

  get running() {
    return this.#running;
  }

  async start() {
    if (this.#running) return this;

    this.#snapshot = await snapshotProjectFiles(this.#projectRoot, this.#options);
    this.#running = true;
    this.#timer = setInterval(() => {
      void this.scan();
    }, this.#options.intervalMs);
    this.#timer.unref?.();

    return this;
  }

  async scan() {
    if (this.#scanning) return [];
    this.#scanning = true;

    try {
      const nextSnapshot = await snapshotProjectFiles(this.#projectRoot, this.#options);
      const changes = diffFileSnapshots(this.#snapshot, nextSnapshot);
      this.#snapshot = nextSnapshot;

      if (changes.length > 0 && typeof this.#options.onChange === 'function') {
        await this.#options.onChange({
          projectRoot: this.#projectRoot,
          changedFiles: changes.map((change) => change.relativePath),
          changes
        });
      }

      return changes;
    } finally {
      this.#scanning = false;
    }
  }

  async stop() {
    if (this.#timer) {
      clearInterval(this.#timer);
      this.#timer = null;
    }
    this.#running = false;
    return this;
  }
}

export function watchProjectFiles(projectRoot = process.cwd(), options = {}) {
  return new ProjectFileWatcher(projectRoot, options);
}

export { DEFAULT_IGNORED_DIRECTORIES };
