import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SUMMARY_SCHEMA_VERSION = 1;

function normalizeString(value, fallback = '') {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === 'string' && item.trim() !== '')
    .map((item) => item.trim());
}

function normalizeChecks(checks = []) {
  if (!Array.isArray(checks)) return [];

  return checks.map((check) => ({
    name: normalizeString(check?.name, 'unnamed check'),
    status: normalizeString(check?.status, 'unknown'),
    command: normalizeString(check?.command, null),
    durationMs: Number.isFinite(check?.durationMs) ? check.durationMs : null,
    notes: normalizeStringList(check?.notes)
  }));
}

function normalizeArtifacts(artifacts = []) {
  if (!Array.isArray(artifacts)) return [];

  return artifacts.map((artifact) => ({
    path: normalizeString(artifact?.path, 'unknown'),
    type: normalizeString(artifact?.type, 'file'),
    description: normalizeString(artifact?.description, '')
  }));
}

function normalizeChanges(changes = []) {
  if (!Array.isArray(changes)) return [];

  return changes.map((change) => ({
    path: normalizeString(change?.path, 'unknown'),
    status: normalizeString(change?.status, 'modified'),
    description: normalizeString(change?.description, '')
  }));
}

export function createVerificationSummary(input = {}) {
  const checks = normalizeChecks(input.checks);
  const generatedAt = normalizeString(input.generatedAt, new Date().toISOString());
  const overallStatus = normalizeString(
    input.overallStatus,
    checks.some((check) => check.status === 'failed') ? 'failed' : 'passed'
  );

  return {
    schemaVersion: SUMMARY_SCHEMA_VERSION,
    generatedAt,
    project: normalizeString(input.project, 'freshbuild'),
    title: normalizeString(input.title, 'Verification Summary'),
    overallStatus,
    branch: normalizeString(input.branch, null),
    commit: normalizeString(input.commit, null),
    checks,
    changedFiles: normalizeStringList(input.changedFiles),
    changes: normalizeChanges(input.changes),
    artifacts: normalizeArtifacts(input.artifacts),
    warnings: normalizeStringList(input.warnings),
    notes: normalizeStringList(input.notes)
  };
}

function renderField(label, value) {
  return value ? `- **${label}:** ${value}` : `- **${label}:** _not recorded_`;
}

function renderList(items, emptyText, renderItem = (item) => `- ${item}`) {
  if (!items.length) return [`- ${emptyText}`];
  return items.map(renderItem);
}

export function renderVerificationSummaryMarkdown(summaryInput = {}) {
  const summary = createVerificationSummary(summaryInput);
  const lines = [
    `# ${summary.title}`,
    '',
    renderField('Project', summary.project),
    renderField('Status', summary.overallStatus),
    renderField('Generated', summary.generatedAt),
    renderField('Branch', summary.branch),
    renderField('Commit', summary.commit),
    '',
    '## Checks',
    ...renderList(summary.checks, 'No checks recorded.', (check) => {
      const command = check.command ? ` — \`${check.command}\`` : '';
      const duration = check.durationMs === null ? '' : ` (${check.durationMs}ms)`;
      return `- **${check.status}** ${check.name}${command}${duration}`;
    }),
    '',
    '## Changed Files',
    ...renderList(summary.changedFiles, 'No changed files recorded.'),
    '',
    '## Change Details',
    ...renderList(summary.changes, 'No change details recorded.', (change) => {
      const description = change.description ? ` — ${change.description}` : '';
      return `- **${change.status}** \`${change.path}\`${description}`;
    }),
    '',
    '## Artifacts',
    ...renderList(summary.artifacts, 'No artifacts recorded.', (artifact) => {
      const description = artifact.description ? ` — ${artifact.description}` : '';
      return `- **${artifact.type}** \`${artifact.path}\`${description}`;
    })
  ];

  if (summary.warnings.length) {
    lines.push('', '## Warnings', ...summary.warnings.map((warning) => `- ${warning}`));
  }

  if (summary.notes.length) {
    lines.push('', '## Notes', ...summary.notes.map((note) => `- ${note}`));
  }

  return `${lines.join('\n')}\n`;
}

export function renderVerificationSummaryJson(summaryInput = {}) {
  return `${JSON.stringify(createVerificationSummary(summaryInput), null, 2)}\n`;
}

export async function writeVerificationSummary(summaryInput = {}, options = {}) {
  const outputDirectory = path.resolve(options.outputDirectory ?? '.freshbuild');
  const markdownPath = path.join(outputDirectory, options.markdownFile ?? 'verification-summary.md');
  const jsonPath = path.join(outputDirectory, options.jsonFile ?? 'verification-summary.json');

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(markdownPath, renderVerificationSummaryMarkdown(summaryInput)),
    writeFile(jsonPath, renderVerificationSummaryJson(summaryInput))
  ]);

  return { markdownPath, jsonPath };
}
