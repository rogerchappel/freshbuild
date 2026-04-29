import path from 'node:path';
import { fileExists, readJsonFile } from '../utils/fs.js';

const LOCKFILE_DETECTIONS = [
  { file: 'pnpm-lock.yaml', name: 'pnpm' },
  { file: 'package-lock.json', name: 'npm' },
  { file: 'npm-shrinkwrap.json', name: 'npm' },
  { file: 'yarn.lock', name: 'yarn' },
  { file: 'bun.lock', name: 'bun' },
  { file: 'bun.lockb', name: 'bun' }
];

const KNOWN_MANAGERS = new Set(['npm', 'pnpm', 'yarn', 'bun']);

export function parsePackageManagerField(value) {
  if (typeof value !== 'string' || value.trim() === '') return null;

  const trimmed = value.trim();
  const atIndex = trimmed.lastIndexOf('@');
  const name = atIndex > 0 ? trimmed.slice(0, atIndex) : trimmed;
  const version = atIndex > 0 ? trimmed.slice(atIndex + 1) : null;

  if (!KNOWN_MANAGERS.has(name)) return null;

  return { name, version: version || null, raw: trimmed };
}

export async function detectPackageManager(projectRoot = process.cwd()) {
  const root = path.resolve(projectRoot);
  const packageJsonPath = path.join(root, 'package.json');
  const packageJsonExists = await fileExists(packageJsonPath);
  const evidence = [];
  const warnings = [];
  let packageJson = null;

  if (packageJsonExists) {
    packageJson = await readJsonFile(packageJsonPath);
    const parsedPackageManager = parsePackageManagerField(packageJson.packageManager);
    if (parsedPackageManager) {
      evidence.push({
        source: 'package.json#packageManager',
        packageManager: parsedPackageManager.name,
        version: parsedPackageManager.version,
        value: parsedPackageManager.raw
      });
    } else if (packageJson.packageManager) {
      warnings.push(`Unsupported packageManager field: ${packageJson.packageManager}`);
    }
  }

  for (const detection of LOCKFILE_DETECTIONS) {
    if (await fileExists(path.join(root, detection.file))) {
      evidence.push({
        source: 'lockfile',
        file: detection.file,
        packageManager: detection.name
      });
    }
  }

  const packageManagerEvidence = evidence.find((item) => item.source === 'package.json#packageManager');
  const lockfileEvidence = evidence.find((item) => item.source === 'lockfile');
  const selectedEvidence = packageManagerEvidence ?? lockfileEvidence ?? null;

  const detectedNames = new Set(evidence.map((item) => item.packageManager));
  if (detectedNames.size > 1) {
    warnings.push(`Conflicting package manager evidence: ${[...detectedNames].join(', ')}`);
  }

  return {
    projectRoot: root,
    packageJsonPath: packageJsonExists ? packageJsonPath : null,
    packageManager: selectedEvidence?.packageManager ?? null,
    version: selectedEvidence?.version ?? null,
    source: selectedEvidence?.source ?? null,
    lockfiles: evidence
      .filter((item) => item.source === 'lockfile')
      .map((item) => ({ file: item.file, packageManager: item.packageManager })),
    hasPackageJson: packageJsonExists,
    evidence,
    warnings
  };
}
