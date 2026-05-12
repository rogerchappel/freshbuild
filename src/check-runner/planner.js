import path from 'node:path';
import { detectBuildScripts } from '../detection/index.js';
import { loadFreshbuildConfig, mergeFreshbuildOptions } from './config.js';

const DEFAULT_TARGET_RULES = [
  { match: /(^|\/)(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb)$/i, categories: ['check', 'typecheck', 'test', 'build', 'lint'], reason: 'package metadata changed' },
  { match: /(^|\/)src\/.*\.(cjs|cts|js|jsx|mjs|mts|ts|tsx)$/i, categories: ['check', 'typecheck', 'test', 'lint', 'build'], reason: 'source file changed' },
  { match: /(^|\/)(test|tests|spec|__tests__)\/.*\.(cjs|cts|js|jsx|mjs|mts|ts|tsx)$/i, categories: ['test', 'lint'], reason: 'test file changed' },
  { match: /\.(test|spec)\.(cjs|cts|js|jsx|mjs|mts|ts|tsx)$/i, categories: ['test', 'lint'], reason: 'test file changed' },
  { match: /\.(md|mdx)$/i, categories: ['check', 'lint'], reason: 'documentation changed' },
  { match: /\.(json|yaml|yml|toml)$/i, categories: ['check', 'lint', 'test'], reason: 'configuration changed' }
];

const DEFAULT_CATEGORY_ORDER = ['check', 'typecheck', 'test', 'lint', 'build'];

function normalizeChangedFiles(changedFiles = []) {
  return [...new Set(changedFiles
    .filter((file) => typeof file === 'string' && file.trim() !== '')
    .map((file) => file.split(path.sep).join('/').replace(/^\.\//, '')))]
    .sort();
}

function categoriesForChangedFiles(changedFiles, rules = DEFAULT_TARGET_RULES) {
  const categories = new Set();
  const reasons = [];

  for (const file of changedFiles) {
    for (const rule of rules) {
      if (rule.match.test(file)) {
        for (const category of rule.categories) categories.add(category);
        reasons.push({ file, reason: rule.reason, categories: rule.categories });
      }
    }
  }

  if (changedFiles.length === 0) {
    categories.add('check');
    categories.add('test');
    reasons.push({ file: null, reason: 'no changed files supplied; using baseline checks', categories: ['check', 'test'] });
  }

  return { categories, reasons };
}

function firstScriptForCategory(scriptsByCategory, category) {
  const scripts = scriptsByCategory[category] ?? [];
  return scripts[0] ?? null;
}

export async function planChecks(projectRoot = process.cwd(), options = {}) {
  const loadedConfig = await loadFreshbuildConfig(projectRoot, options);
  const effectiveOptions = mergeFreshbuildOptions(loadedConfig.config, options);
  const changedFiles = normalizeChangedFiles(effectiveOptions.changedFiles ?? []);
  const detection = effectiveOptions.buildScriptDetection ?? await detectBuildScripts(projectRoot, effectiveOptions);
  const { categories, reasons } = categoriesForChangedFiles(changedFiles, effectiveOptions.rules ?? DEFAULT_TARGET_RULES);
  const categoryOrder = effectiveOptions.categoryOrder ?? DEFAULT_CATEGORY_ORDER;
  const allowCategories = new Set(effectiveOptions.allowCategories ?? categoryOrder);
  const selected = [];
  const seenScripts = new Set();

  for (const category of categoryOrder) {
    if (!categories.has(category) || !allowCategories.has(category)) continue;
    const script = firstScriptForCategory(detection.scriptsByCategory ?? {}, category);
    if (!script || seenScripts.has(script.name)) continue;
    seenScripts.add(script.name);
    selected.push({
      id: script.name,
      name: script.name,
      category,
      packageManager: detection.packageManager,
      command: script.command,
      runCommand: script.runCommand,
      reason: reasons.find((item) => item.categories.includes(category))?.reason ?? `selected for ${category}`
    });
  }

  return {
    projectRoot: detection.projectRoot,
    packageManager: detection.packageManager,
    changedFiles,
    categories: [...categories].sort(),
    reasons,
    checks: selected,
    configPath: loadedConfig.path,
    warnings: [...(detection.warnings ?? []), ...(loadedConfig.warnings ?? [])]
  };
}

export { DEFAULT_CATEGORY_ORDER, DEFAULT_TARGET_RULES };
