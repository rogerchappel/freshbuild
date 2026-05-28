import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createPlan } from "../src/planner.js";
import type { PackageInfo } from "../src/types.js";

const packageInfo: PackageInfo = {
  root: resolve("fixtures/npm-basic"),
  packageManager: "npm",
  packageName: "fixture",
  scripts: {
    check: "tsc --noEmit",
    test: "node --test",
    build: "tsc",
    deploy: "gh release create"
  }
};

describe("planner", () => {
  it("chooses core safe checks when no changed files are supplied", () => {
    const plan = createPlan(packageInfo);

    assert.deepEqual(plan.scripts, ["check", "test"]);
    assert.equal(plan.reason, "No changed files were supplied; running core safe checks.");
  });

  it("does not choose package scripts outside the allowlist", () => {
    const plan = createPlan(packageInfo, { requestedScripts: ["deploy"] });

    assert.deepEqual(plan.scripts, []);
    assert.match(plan.reason, /No requested scripts/);
  });

  it("limits docs-only changes to the smallest useful checks", () => {
    const plan = createPlan(packageInfo, { changedFiles: ["docs/PRD.md", "README.md"] });

    assert.deepEqual(plan.scripts, ["check", "test"]);
  });

  it("honors explicit safe script requests", () => {
    const plan = createPlan(packageInfo, { requestedScripts: ["build"] });

    assert.deepEqual(plan.scripts, ["build"]);
  });
});
