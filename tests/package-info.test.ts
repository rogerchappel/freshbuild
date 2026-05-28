import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { detectPackageManager, readPackageInfo } from "../src/package-info.js";

const fixtureRoot = resolve("fixtures/npm-basic");

describe("package info", () => {
  it("defaults to npm when no lockfile or packageManager field exists", () => {
    assert.equal(detectPackageManager(fixtureRoot), "npm");
  });

  it("reads package scripts from package.json", () => {
    const info = readPackageInfo(fixtureRoot);

    assert.equal(info.packageName, "freshbuild-fixture-npm-basic");
    assert.deepEqual(Object.keys(info.scripts).sort(), ["build", "check", "deploy", "test"]);
  });
});
