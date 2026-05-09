import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const execFileAsync = promisify(execFile);
const cli = fileURLToPath(new URL('../src/cli.js', import.meta.url));

describe('cli', () => {
  it('prints useful help without planning checks', async () => {
    const { stdout } = await execFileAsync(process.execPath, [cli, '--help']);

    assert.match(stdout, /freshbuild — local-first check planner/);
    assert.match(stdout, /freshbuild run/);
    assert.match(stdout, /--dry-run/);
  });

  it('prints the package version', async () => {
    const { stdout } = await execFileAsync(process.execPath, [cli, '--version']);
    const packageJson = (await import('../package.json', { with: { type: 'json' } })).default;

    assert.equal(stdout.trim(), packageJson.version);
  });

  it('fails clearly when an option value is missing', async () => {
    await assert.rejects(
      () => execFileAsync(process.execPath, [cli, 'run', '--root']),
      /Missing value for --root/,
    );
  });
});
