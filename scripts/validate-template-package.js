#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const TEXT_EXTENSIONS = new Set([".json", ".html", ".css", ".txt"]);
const REQUIRED_FILES = [
  "template.json",
  "variables.json",
  "preview/index.html"
];

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

function readJson(filePath, issues) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    issues.push(`Invalid JSON: ${filePath} (${error.message})`);
    return null;
  }
}

function validateTemplatePackage(templateDir) {
  const issues = [];
  const warnings = [];
  const absoluteDir = path.resolve(templateDir);

  if (!fs.existsSync(absoluteDir)) {
    return { verdict: "FAIL", issues: [`Template directory not found: ${absoluteDir}`], warnings };
  }

  for (const file of REQUIRED_FILES) {
    const filePath = path.join(absoluteDir, file);
    if (!fs.existsSync(filePath)) issues.push(`Missing required file: ${file}`);
  }

  const template = fs.existsSync(path.join(absoluteDir, "template.json"))
    ? readJson(path.join(absoluteDir, "template.json"), issues)
    : null;
  const variables = fs.existsSync(path.join(absoluteDir, "variables.json"))
    ? readJson(path.join(absoluteDir, "variables.json"), issues)
    : null;

  if (template) {
    if (!template.templateId) issues.push("template.json missing templateId");
    if (!template.stack?.theme) warnings.push("template.json missing stack.theme");
    if (!Array.isArray(template.pages) || template.pages.length === 0) issues.push("template.json pages must be a non-empty array");
  }

  if (variables) {
    if (!Array.isArray(variables.required) || variables.required.length === 0) {
      issues.push("variables.json required must be a non-empty array");
    }
  }

  const files = walk(absoluteDir);
  for (const filePath of files) {
    const ext = path.extname(filePath);
    if (ext === ".json") readJson(filePath, issues);
    if (TEXT_EXTENSIONS.has(ext)) {
      const text = fs.readFileSync(filePath, "utf8");
      const placeholders = text.match(/\{\{[A-Z0-9_]+\}\}/g) || [];
      if (filePath.endsWith("variables.json")) continue;
      if (placeholders.length && !variables?.required?.length) {
        warnings.push(`Placeholders found but variable manifest is empty: ${path.relative(absoluteDir, filePath)}`);
      }
    }
  }

  return {
    verdict: issues.length ? "FAIL" : "PASS",
    templateDir: absoluteDir,
    issues,
    warnings
  };
}

function main() {
  const template = getArg("template");
  if (!template) {
    console.error("Usage: node scripts/validate-template-package.js --template <template-package-dir>");
    process.exit(1);
  }
  const result = validateTemplatePackage(template);
  console.log(JSON.stringify(result, null, 2));
  if (result.verdict !== "PASS") process.exit(1);
}

main();
