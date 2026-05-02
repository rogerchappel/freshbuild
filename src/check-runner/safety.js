const DEFAULT_ALLOWED_SCRIPT_NAMES = /^(build|compile|bundle|test|test:[\w:-]+|lint|lint:[\w:-]+|check|validate|verify|typecheck|type-check|tsc)$/;
const DEFAULT_ALLOWED_PACKAGE_MANAGERS = new Set(['npm', 'pnpm', 'yarn', 'bun']);
const DEFAULT_ALLOWED_COMMANDS = new Set([
  'node', 'npm', 'pnpm', 'yarn', 'bun',
  'tsc', 'vite', 'vitest', 'eslint', 'biome', 'prettier', 'playwright', 'jest', 'mocha', 'ava', 'tap', 'tsx'
]);
const UNSAFE_SHELL_TOKENS = /[;&|`$<>]/;

function firstCommandToken(command = '') {
  const trimmed = String(command).trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0].replace(/^['"]|['"]$/g, '');
}

export function validateCheckSafety(check, options = {}) {
  const allowedScriptNames = options.allowedScriptNames ?? DEFAULT_ALLOWED_SCRIPT_NAMES;
  const allowedPackageManagers = options.allowedPackageManagers ?? DEFAULT_ALLOWED_PACKAGE_MANAGERS;
  const allowedCommands = options.allowedCommands ?? DEFAULT_ALLOWED_COMMANDS;
  const errors = [];

  if (!check || typeof check !== 'object') errors.push('check must be an object');
  const scriptName = check?.name;
  const packageManager = check?.packageManager;
  const command = check?.command ?? '';
  const firstToken = firstCommandToken(command);

  if (typeof scriptName !== 'string' || !allowedScriptNames.test(scriptName)) {
    errors.push(`script name is not allowlisted: ${scriptName ?? '<missing>'}`);
  }
  if (!allowedPackageManagers.has(packageManager)) {
    errors.push(`package manager is not allowlisted: ${packageManager ?? '<missing>'}`);
  }
  if (!Array.isArray(check?.runCommand) || check.runCommand.length < 3 || check.runCommand[1] !== 'run' || check.runCommand[2] !== scriptName) {
    errors.push('runCommand must be a package-manager run invocation for the detected script');
  }
  if (!firstToken || !allowedCommands.has(firstToken)) {
    errors.push(`script command is not allowlisted: ${firstToken ?? '<empty>'}`);
  }
  if (UNSAFE_SHELL_TOKENS.test(command)) {
    errors.push('script command contains shell control tokens that freshbuild refuses by default');
  }

  return { ok: errors.length === 0, errors };
}

export { DEFAULT_ALLOWED_COMMANDS, DEFAULT_ALLOWED_PACKAGE_MANAGERS, DEFAULT_ALLOWED_SCRIPT_NAMES };
