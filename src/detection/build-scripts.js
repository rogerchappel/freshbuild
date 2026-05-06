import path from 'node:path';
import { fileExists, readJsonFile } from '../utils/fs.js';
import { detectPackageManager } from './package-manager.js';

const DEFAULT_SCRIPT_CATEGORIES = {
  build: ['build', 'compile', 'bundle'],
  test: ['test', 'test:unit', 'test:integration', 'test:e2e'],
  check: ['check', 'validate', 'verify'],
  lint: ['lint', 'lint:fix'],
  typecheck: ['typecheck', 'type-check', 'tsc']
};

function commandFor(packageManager, scriptName) {
  if (!packageManager) return null;

  switch (packageManager) {
    case 'npm':
      return ['npm', 'run', scriptName];
    case 'pnpm':
      return ['pnpm', 'run', scriptName];
    case 'yarn':
      return ['yarn', 'run', scriptName];
    case 'bun':
      return ['bun', 'run', scriptName];
    default:
      return null;
  }
}

function categorizeScript(scriptName) {
  const categories = [];
  for (const [category, names] of Object.entries(DEFAULT_SCRIPT_CATEGORIES)) {
    if (names.includes(scriptName) || names.some((name) => scriptName.startsWith(`${name}:`))) {
      categories.push(category);
    }
  }
  return categories;
}

function categoryRank(scriptName, category) {
  const preferredNames = DEFAULT_SCRIPT_CATEGORIES[category] ?? [];
  const exactIndex = preferredNames.indexOf(scriptName);
  if (exactIndex !== -1) return exactIndex;

  const familyIndex = preferredNames.findIndex((name) => scriptName.startsWith(`${name}:`));
  return familyIndex === -1 ? Number.MAX_SAFE_INTEGER : familyIndex + 0.5;
}

function compareScriptsForCategory(category) {
  return (left, right) => {
    const rankDelta = categoryRank(left.name, category) - categoryRank(right.name, category);
    if (rankDelta !== 0) return rankDelta;
    return left.name.localeCompare(right.name);
  };
}

export async function detectBuildScripts(projectRoot = process.cwd(), options = {}) {
  const root = path.resolve(projectRoot);
  const packageJsonPath = path.join(root, 'package.json');

  if (!(await fileExists(packageJsonPath))) {
    return {
      projectRoot: root,
      packageJsonPath: null,
      packageManager: null,
      scripts: [],
      scriptsByCategory: {},
      hasPackageJson: false,
      warnings: []
    };
  }

  const [packageJson, packageManagerDetection] = await Promise.all([
    readJsonFile(packageJsonPath),
    options.packageManagerDetection ?? detectPackageManager(root)
  ]);

  const rawScripts = packageJson.scripts && typeof packageJson.scripts === 'object' ? packageJson.scripts : {};
  const scripts = Object.entries(rawScripts)
    .filter(([, command]) => typeof command === 'string')
    .map(([name, command]) => {
      const categories = categorizeScript(name);
      return {
        name,
        command,
        categories,
        runCommand: commandFor(packageManagerDetection.packageManager, name)
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const scriptsByCategory = {};
  for (const script of scripts) {
    for (const category of script.categories) {
      scriptsByCategory[category] ??= [];
      scriptsByCategory[category].push(script);
    }
  }

  for (const [category, categoryScripts] of Object.entries(scriptsByCategory)) {
    categoryScripts.sort(compareScriptsForCategory(category));
  }

  return {
    projectRoot: root,
    packageJsonPath,
    packageManager: packageManagerDetection.packageManager,
    scripts,
    scriptsByCategory,
    hasPackageJson: true,
    warnings: packageManagerDetection.warnings
  };
}

export { DEFAULT_SCRIPT_CATEGORIES };
