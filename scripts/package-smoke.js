import { execFileSync } from "node:child_process";

const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8"
});
const [pack] = JSON.parse(output);
const packedFiles = new Set(pack.files.map((file) => file.path));

const requiredFiles = [
  "src/cli.js",
  "src/index.js",
  "examples/basic-watch.js",
  "docs/LOCAL_FIRST.md",
  "docs/orchestration.json",
  "README.md",
  "LICENSE",
  "SECURITY.md",
  "CHANGELOG.md"
];

const missing = requiredFiles.filter((file) => !packedFiles.has(file));
if (missing.length > 0) {
  console.error(`Package smoke failed; missing files:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log(`package smoke ok: ${pack.filename} includes ${pack.files.length} files`);
