import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { commandForScript } from "../src/runner.js";

describe("runner", () => {
  it("builds package-manager-native run commands", () => {
    assert.deepEqual(commandForScript("npm", "test"), ["npm", "run", "test"]);
    assert.deepEqual(commandForScript("pnpm", "test"), ["pnpm", "test"]);
    assert.deepEqual(commandForScript("yarn", "test"), ["yarn", "test"]);
    assert.deepEqual(commandForScript("bun", "test"), ["bun", "run", "test"]);
  });
});
