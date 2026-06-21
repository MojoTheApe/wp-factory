#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const {
  ROOT,
  readJson,
  writeJson,
  slugify,
  titleFromDomain,
  initials,
  pick,
  hash,
  parseCsv,
  htmlEscape
} = require("./lib");
const { resolveStockImages } = require("./stock-images");

function getArg(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function makeBrandKit(input, patternLibrary, batchIndex) {
  const seed = hash(`${input.domain}:${batchIndex}`);
  const palette = pick(patternLibrary.palettes, seed, batchIndex);
  const fontPair = pick(patternLibrary.fontPairs, seed, batchIndex * 2);
  const radius = [2, 6, 10, 14, 22][seed % 5];

  return {
    company: input.companyName,
    palette,
    headingFont: fontPair.heading,
    bodyFont: fontPair.body,
    logoStyle: pick(["geometric wordmark", "stacked initials mark", "clean text mark", "rounded badge wordmark"], seed, 3),
    buttonRadius: radius,
    markRadius: [8, 18, 35, 50][seed % 4],
    imageDirection: pick(patternLibrary.imageDirections, seed, 5)
  };
}

function makeCopy(input, copyPools, seed) {
  const services = [...copyPools.services]
    .sort((a, b) => hash(`${input.domain}:${a.title}`) - hash(`${input.domain}:${b.title}`))
    .slice(0, 3);

  return {
    heroKicker: pick(copyPools.heroKickers, seed),
    heroTitle: `${input.companyName} creates simple digital foundations for growing brands.`,
    heroBody: pick(copyPools.heroTemplates, seed, 1).replaceAll("{company}", input.companyName),
    introBody: pick(copyPools.introTemplates, seed, 2),
    services,
    aboutBody: `${input.companyName} is a practical ${input.niche} focused on websites, brand clarity, content structure, and useful campaign support. The aim is to make digital work easier to understand, launch, and improve.`,
    whyChoose: [...copyPools.whyChoose].sort((a, b) => hash(`${a}:${seed}`) - hash(`${b}:${seed}`)).slice(0, 4),
    ctaBody: pick(copyPools.ctas, seed, 3),
    footerSummary: `A straightforward digital partner for web presence, campaign support, and brand communication.`
  };
}

function makeComposition(input, patternLibrary, seed, batchIndex) {
  return {
    layoutFamily: pick(patternLibrary.layoutFamilies, seed, batchIndex),
    header: pick(patternLibrary.headers, seed, batchIndex + 1),
    hero: pick(patternLibrary.heroes, seed, batchIndex + 2),
    services: pick(patternLibrary.services, seed, batchIndex + 3),
    about: pick(patternLibrary.about, seed, batchIndex + 4),
    cta: pick(patternLibrary.cta, seed, batchIndex + 5),
    footer: pick(patternLibrary.footers, seed, batchIndex + 6)
  };
}

function makeAssetPlan(input, brandKit, seed) {
  const baseQuery = `${input.niche} ${brandKit.imageDirection}`;
  const serviceThemes = [
    "website planning workspace",
    "brand design laptop",
    "marketing analytics dashboard"
  ];

  return {
    logo: {
      type: "generated-wordmark",
      text: initials(input.companyName)
    },
    images: {
      provider: "unsplash-source",
      hero: {
        role: "hero",
        query: baseQuery,
        alt: `${input.companyName} ${brandKit.imageDirection}`,
        url: `https://source.unsplash.com/1200x800/?${encodeURIComponent(baseQuery)}`
      },
      services: serviceThemes.map((theme, index) => ({
        role: `service_${index + 1}`,
        query: `${input.niche} ${theme}`,
        alt: `${input.companyName} ${theme}`,
        url: `https://source.unsplash.com/800x600/?${encodeURIComponent(`${input.niche} ${theme}`)}`
      }))
    },
    notes: [
      "Stock-image URLs are preview placeholders.",
      "Production should replace these with downloaded, licensed assets and saved attribution."
    ]
  };
}

function renderPreview(site, outputDir) {
  const template = fs.readFileSync(path.join(ROOT, "templates/static-preview.html"), "utf8");
  const fontFamilies = `${site.brandKit.headingFont.replaceAll(" ", "+")}:wght@600;700;800&family=${site.brandKit.bodyFont.replaceAll(" ", "+")}:wght@400;600;700`;
  const servicesHtml = site.copy.services
    .map((service, index) => {
      const image = site.assets.images.services[index];
      return `<article class="card"><img src="${htmlEscape(image.url)}" alt="${htmlEscape(image.alt)}"><h3>${htmlEscape(service.title)}</h3><p class="muted">${htmlEscape(service.body)}</p></article>`;
    })
    .join("\n          ");
  const whyHtml = site.copy.whyChoose
    .map((item) => `<div class="item"><span class="dot"></span><span>${htmlEscape(item)}</span></div>`)
    .join("");
  const heroBackground = site.templateComposition.hero.includes("gradient")
    ? `linear-gradient(135deg, ${site.brandKit.palette.background}, rgba(255,255,255,.9))`
    : site.brandKit.palette.background;

  const replacements = {
    language: site.language,
    companyName: site.companyName,
    domain: site.domain,
    country: site.country,
    city: site.city || "Local office",
    initials: initials(site.companyName),
    fontUrl: `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`,
    headingFont: site.brandKit.headingFont,
    bodyFont: site.brandKit.bodyFont,
    primaryColor: site.brandKit.palette.primary,
    accentColor: site.brandKit.palette.accent,
    backgroundColor: site.brandKit.palette.background,
    textColor: site.brandKit.palette.text,
    radius: site.brandKit.buttonRadius,
    markRadius: site.brandKit.markRadius,
    heroBackground,
    imageDirection: site.brandKit.imageDirection,
    heroKicker: site.copy.heroKicker,
    heroTitle: site.copy.heroTitle,
    heroBody: site.copy.heroBody,
    heroImageUrl: site.assets.images.hero.url,
    heroImageAlt: site.assets.images.hero.alt,
    introBody: site.copy.introBody,
    aboutBody: site.copy.aboutBody,
    ctaBody: site.copy.ctaBody,
    footerSummary: site.copy.footerSummary,
    servicesHtml,
    whyHtml
  };

  let html = template;
  for (const [key, value] of Object.entries(replacements)) {
    html = html.replaceAll(`{{${key}}}`, String(value));
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "index.html"), html);
}

function qaSite(site, projectDir) {
  const htmlPath = path.join(projectDir, "preview/index.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const blockingIssues = [];
  const warnings = [];

  for (const page of ["Home", "About Us", "Services", "Contact", "Privacy Policy", "Terms and Conditions", "Cookie Policy"]) {
    if (!site.pages.some((item) => item.title === page)) blockingIssues.push(`Missing page: ${page}`);
  }
  if (!html.includes(site.companyName)) blockingIssues.push("Company name missing from preview");
  if (/lorem ipsum|placeholder|TODO/i.test(html)) blockingIssues.push("Placeholder text found");
  if (!html.includes("Privacy Policy") || !html.includes("Terms and Conditions") || !html.includes("Cookie Policy")) {
    blockingIssues.push("Legal footer links missing");
  }
  if (site.copy.services.length < 3) blockingIssues.push("Fewer than three services generated");
  if (site.templateComposition.layoutFamily === "agency_modern_clear") warnings.push("Common layout family selected");

  return {
    verdict: blockingIssues.length ? "FAIL" : "PASS",
    blockingIssues,
    warnings,
    checkedAt: new Date().toISOString()
  };
}

function createSite(input, batchIndex, config, patternLibrary, copyPools) {
  const domain = input.domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  const companyName = input.companyName || titleFromDomain(domain);
  const seed = hash(`${domain}:${companyName}`);
  const projectId = `wp_${slugify(companyName)}_${String(batchIndex + 1).padStart(4, "0")}`;
  const normalized = {
    domain,
    companyName,
    niche: input.niche || config.defaultNiche,
    language: input.language || config.defaultLanguage,
    country: input.country || config.defaultCountry,
    city: input.city || ""
  };

  const brandKit = makeBrandKit(normalized, patternLibrary, batchIndex);
  const site = {
    projectId,
    ...normalized,
    brandKit,
    copy: makeCopy(normalized, copyPools, seed),
    templateComposition: makeComposition(normalized, patternLibrary, seed, batchIndex),
    pages: config.requiredPages.map((title) => ({ title, slug: slugify(title), status: "draft-ready" })),
    assets: makeAssetPlan(normalized, brandKit, seed),
    deployment: {
      status: "not_configured",
      note: "MVP does not deploy to WordPress."
    },
    qa: {}
  };

  return site;
}

async function main() {
  const inputPath = getArg("input");
  const limit = Number(getArg("limit", "0"));
  if (!inputPath) {
    console.error("Usage: node wp-factory/scripts/batch-run.js --input <csv> [--limit 5]");
    process.exit(1);
  }

  const config = readJson("config/factory.config.json");
  const patternLibrary = readJson("config/pattern-library.json");
  const copyPools = readJson("config/copy-pools.json");
  const rows = parseCsv(fs.readFileSync(path.resolve(inputPath), "utf8")).slice(0, limit || undefined);
  const summary = [];

  for (const [index, row] of rows.entries()) {
    const site = createSite(row, index, config, patternLibrary, copyPools);
    site.assets = await resolveStockImages(site.assets, {
      rootDir: ROOT,
      seed: hash(`${site.domain}:${site.companyName}:images`)
    });
    const projectDir = path.join(ROOT, "projects", site.projectId);
    renderPreview(site, path.join(projectDir, "preview"));
    site.qa = qaSite(site, projectDir);
    writeJson(path.join(projectDir, "site.json"), site);
    writeJson(path.join(projectDir, "qa-report.json"), site.qa);
    summary.push({
      projectId: site.projectId,
      domain: site.domain,
      companyName: site.companyName,
      verdict: site.qa.verdict,
      preview: path.relative(process.cwd(), path.join(projectDir, "preview/index.html"))
    });
  }

  writeJson(path.join(ROOT, "projects", "last-batch-summary.json"), summary);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
