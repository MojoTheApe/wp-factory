#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { initials, ROOT, writeJson } = require("./lib");

const TEXT_EXTENSIONS = new Set([".json", ".html", ".css", ".txt"]);

function getArg(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function buildVariables(site) {
  const services = site.copy.services || [];
  const palette = site.brandKit.palette;
  return {
    COMPANY_NAME: site.companyName,
    DOMAIN: site.domain,
    PRIMARY_COLOR: palette.primary,
    ACCENT_COLOR: palette.accent,
    BACKGROUND_COLOR: palette.background,
    TEXT_COLOR: palette.text,
    HEADING_FONT: site.brandKit.headingFont,
    BODY_FONT: site.brandKit.bodyFont,
    LOGO_TEXT: initials(site.companyName),
    HERO_KICKER: site.copy.heroKicker,
    HERO_TITLE: site.copy.heroTitle,
    HERO_BODY: site.copy.heroBody,
    INTRO_BODY: site.copy.introBody,
    ABOUT_BODY: site.copy.aboutBody,
    CTA_BODY: site.copy.ctaBody,
    SERVICE_1_TITLE: services[0]?.title || "Website Planning",
    SERVICE_1_BODY: services[0]?.body || "",
    SERVICE_2_TITLE: services[1]?.title || "Brand Positioning",
    SERVICE_2_BODY: services[1]?.body || "",
    SERVICE_3_TITLE: services[2]?.title || "Campaign Support",
    SERVICE_3_BODY: services[2]?.body || "",
    CITY: site.city || "Local office",
    COUNTRY: site.country
  };
}

function applyVariables(text, variables) {
  return Object.entries(variables).reduce(
    (current, [key, value]) => current.replaceAll(`{{${key}}}`, String(value)),
    text
  );
}

function copyTemplate(templateDir, outputDir, variables) {
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  for (const sourcePath of walk(templateDir)) {
    const relativePath = path.relative(templateDir, sourcePath);
    if (relativePath === "variables.json") continue;
    const targetPath = path.join(outputDir, relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    const ext = path.extname(sourcePath);
    if (TEXT_EXTENSIONS.has(ext)) {
      const rendered = applyVariables(fs.readFileSync(sourcePath, "utf8"), variables);
      fs.writeFileSync(targetPath, rendered);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function validateVariables(templateDir, variables) {
  const manifestPath = path.join(templateDir, "variables.json");
  if (!fs.existsSync(manifestPath)) return [];
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  return (manifest.required || []).filter((key) => !variables[key]);
}

function main() {
  const sitePath = getArg("site");
  const templatePath = getArg("template");
  if (!sitePath || !templatePath) {
    console.error("Usage: node scripts/build-template-package.js --site <site.json> --template <template-package-dir>");
    process.exit(1);
  }

  const site = JSON.parse(fs.readFileSync(path.resolve(sitePath), "utf8"));
  const templateDir = path.resolve(templatePath);
  const variables = buildVariables(site);
  const missing = validateVariables(templateDir, variables);
  if (missing.length) {
    console.error(`Missing template variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  const outputDir = path.join(ROOT, "exports", site.projectId);
  copyTemplate(templateDir, outputDir, variables);
  writeJson(path.join(outputDir, "site-package.json"), {
    projectId: site.projectId,
    domain: site.domain,
    companyName: site.companyName,
    sourceSite: path.relative(ROOT, path.resolve(sitePath)),
    template: path.basename(templateDir),
    createdAt: new Date().toISOString()
  });

  console.log(JSON.stringify({
    projectId: site.projectId,
    output: path.relative(process.cwd(), outputDir),
    preview: path.relative(process.cwd(), path.join(outputDir, "preview/index.html"))
  }, null, 2));
}

main();
