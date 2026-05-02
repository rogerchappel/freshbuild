import { DebouncedCheckRunner, watchProjectFiles } from '../src/index.js';

const runner = new DebouncedCheckRunner(process.cwd(), {
  debounceMs: 500,
  outputDirectory: '.freshbuild'
});

const watcher = watchProjectFiles(process.cwd(), {
  intervalMs: 750,
  onChange(event) {
    console.log('freshbuild changed files:', event.changedFiles);
    void runner.schedule(event.changedFiles);
  }
});

await watcher.start();
console.log('freshbuild watching. Press Ctrl+C to stop.');
