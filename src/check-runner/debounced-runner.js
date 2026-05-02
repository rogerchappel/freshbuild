import { CheckRunner } from './runner.js';

export class DebouncedCheckRunner {
  #runner;
  #timer = null;
  #pendingFiles = new Set();

  constructor(projectRoot = process.cwd(), options = {}) {
    this.projectRoot = projectRoot;
    this.options = { debounceMs: 300, ...options };
    this.#runner = options.runner ?? new CheckRunner();
  }

  schedule(changedFiles = [], options = {}) {
    for (const file of changedFiles) this.#pendingFiles.add(file);
    if (this.#timer) clearTimeout(this.#timer);
    return new Promise((resolve) => {
      this.#timer = setTimeout(async () => {
        const files = [...this.#pendingFiles].sort();
        this.#pendingFiles.clear();
        this.#timer = null;
        resolve(await this.#runner.run(this.projectRoot, { ...this.options, ...options, changedFiles: files }));
      }, this.options.debounceMs);
      this.#timer.unref?.();
    });
  }

  cancel() {
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = null;
    this.#pendingFiles.clear();
  }
}
