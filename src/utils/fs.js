import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

export async function fileExists(filePath) {
  try {
    const result = await stat(filePath);
    return result.isFile();
  } catch (error) {
    if (error && error.code === 'ENOENT') return false;
    throw error;
  }
}

export async function readJsonFile(filePath) {
  const raw = await readFile(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    const wrapped = new Error(`Invalid JSON in ${path.basename(filePath)}: ${error.message}`);
    wrapped.cause = error;
    throw wrapped;
  }
}
