#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function getArg(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function validateExportPackage(exportDir) {
  const issues = [];
  const warnings = [];
  const absoluteDir = path.resolve(exportDir);

  if (!fs.existsSync(absoluteDir)) {
    return { verdict: "FAIL", issues: [`Export directory not found: ${absoluteDir}`], warnings };
  }

  for (const required of ["template.json", "site-package.json", "preview/index.html"]) {
    if (!fs.existsSync(path.join(absoluteDir, required))) issues.push(`Missing required file: ${required}`);
  }

  for (const filePath of walk(absoluteDir)) {
    const relative = path.relative(absoluteDir, filePath);
    const ext = path.extname(filePath);
    if ([".json", ".html", ".css", ".txt"].includes(ext)) {
      const text = fs.readFileSync(filePath, "utf8");
      const placeholders = text.match(/\{\{[A-Z0-9_]+\}\}/g) || [];
      if (placeholders.length) issues.push(`Unresolved placeholders in ${relative}: ${[...new Set(placeholders)].join(", ")}`);
      if (ext === ".json") {
        try {
          JSON.parse(text);
        } catch (error) {
          issues.push(`Invalid JSON in ${relative}: ${error.message}`);
        }
      }
    }
  }

  return {
    verdict: issues.length ? "FAIL" : "PASS",
    exportDir: absoluteDir,
    issues,
    warnings
  };
}

function main() {
  const dir = getArg("dir");
  if (!dir) {
    console.error("Usage: node scripts/validate-export-package.js --dir <exports/projectId>");
    process.exit(1);
  }
  const result = validateExportPackage(dir);
  console.log(JSON.stringify(result, null, 2));
  if (result.verdict !== "PASS") process.exit(1);
}

main();
