import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildSummary, renderMarkdown } from "../src/proof.js";
import type { BuildPlan, CommandResult } from "../src/types.js";

const plan: BuildPlan = {
  root: "/tmp/project",
  packageManager: "npm",
  scripts: ["test"],
  changedFiles: ["src/index.ts"],
  reason: "Selected safe package scripts from changed file categories."
};

describe("proof", () => {
  it("marks summaries as passed when all command results pass", () => {
    const summary = buildSummary(plan, [result("test", 0)]);

    assert.equal(summary.status, "passed");
  });

  it("renders markdown with commands and changed files", () => {
    const markdown = renderMarkdown(buildSummary(plan, [result("test", 0)]));

    assert.match(markdown, /# freshbuild Verification/);
    assert.match(markdown, /PASS `npm run test`/);
    assert.match(markdown, /`src\/index.ts`/);
  });
});

function result(script: string, exitCode: number): CommandResult {
  return {
    script,
    command: ["npm", "run", script],
    exitCode,
    durationMs: 12,
    stdout: "",
    stderr: ""
  };
}
