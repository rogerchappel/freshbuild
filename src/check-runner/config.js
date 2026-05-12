import path from 'node:path';
import { fileExists, readJsonFile } from '../utils/fs.js';

const DEFAULT_CONFIG_FILENAMES = ['.freshbuild.json'];
const CONFIG_ARRAY_FIELDS = new Set(['changedFiles', 'allowCategories', 'categoryOrder']);
const CONFIG_SCALAR_FIELDS = new Set(['outputDirectory', 'timeoutMs', 'writeSummary']);

function normalizeConfigArray(value, field) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.trim() === '')) {
    throw new TypeError(`${field} must be an array of non-empty strings`);
  }
  return [...new Set(value.map((item) => item.trim()))];
}

function normalizeConfigValue(config = {}) {
  const normalized = {};

  for (const field of CONFIG_ARRAY_FIELDS) {
    const value = normalizeConfigArray(config[field], field);
    if (value !== undefined) normalized[field] = value;
  }

  if (config.outputDirectory !== undefined) {
    if (typeof config.outputDirectory !== 'string' || config.outputDirectory.trim() === '') {
      throw new TypeError('outputDirectory must be a non-empty string');
    }
    normalized.outputDirectory = config.outputDirectory.trim();
  }

  if (config.timeoutMs !== undefined) {
    if (!Number.isInteger(config.timeoutMs) || config.timeoutMs <= 0) {
      throw new TypeError('timeoutMs must be a positive integer');
    }
    normalized.timeoutMs = config.timeoutMs;
  }

  if (config.writeSummary !== undefined) {
    if (typeof config.writeSummary !== 'boolean') throw new TypeError('writeSummary must be a boolean');
    normalized.writeSummary = config.writeSummary;
  }

  return normalized;
}

export async function loadFreshbuildConfig(projectRoot = process.cwd(), options = {}) {
  if (options.config === false) return { path: null, config: {}, warnings: [] };

  const root = path.resolve(projectRoot);
  const candidates = options.configPath
    ? [path.resolve(root, options.configPath)]
    : DEFAULT_CONFIG_FILENAMES.map((filename) => path.join(root, filename));

  for (const candidate of candidates) {
    if (!(await fileExists(candidate))) continue;
    const rawConfig = await readJsonFile(candidate);
    return {
      path: candidate,
      config: normalizeConfigValue(rawConfig),
      warnings: []
    };
  }

  return { path: null, config: {}, warnings: [] };
}

export function mergeFreshbuildOptions(config = {}, options = {}) {
  const merged = { ...options };

  for (const field of CONFIG_ARRAY_FIELDS) {
    merged[field] = options[field] && options[field].length > 0 ? options[field] : config[field];
  }

  for (const field of CONFIG_SCALAR_FIELDS) {
    merged[field] = options[field] === undefined ? config[field] : options[field];
  }

  return merged;
}

export { DEFAULT_CONFIG_FILENAMES };
