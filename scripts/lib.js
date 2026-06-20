const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromDomain(domain) {
  const clean = String(domain).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "");
  const base = clean.split(".")[0] || clean;
  const tokens = [
    "global",
    "world",
    "realm",
    "orbit",
    "union",
    "watch",
    "signal",
    "metric",
    "brand",
    "proof",
    "pulse",
    "puffy",
    "paws",
    "fresh",
    "bright",
    "peak",
    "flow",
    "wire",
    "code",
    "step",
    "port",
    "crew",
    "ally",
    "key",
    "go"
  ];
  const pattern = new RegExp(tokens.join("|"), "g");
  const matched = base.match(pattern);
  const words = matched && matched.join("") === base
    ? matched
    : base.split(/[-_\s]+/).filter(Boolean);
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function initials(companyName) {
  return companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function pick(list, seed, offset = 0) {
  return list[Math.abs(seed + offset) % list.length];
}

function hash(value) {
  let h = 0;
  for (const char of String(value)) {
    h = (h << 5) - h + char.charCodeAt(0);
    h |= 0;
  }
  return Math.abs(h);
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const headers = lines.shift().split(",").map((item) => item.trim());
  return lines.map((line) => {
    const values = line.split(",").map((item) => item.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
}

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = {
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
};
