const fs = require("fs");
const path = require("path");

function readEnvFile(rootDir) {
  const envPath = path.join(rootDir, ".env");
  if (!fs.existsSync(envPath)) return {};

  return Object.fromEntries(
    fs.readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

function previewImageUrl(width, height, query) {
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}`;
}

function fallbackImage(role, query, alt, width, height) {
  return {
    role,
    query,
    alt,
    provider: "unsplash-source",
    source: "preview-placeholder",
    url: previewImageUrl(width, height, query),
    attribution: null
  };
}

async function pexelsSearch(query, apiKey, seed) {
  const params = new URLSearchParams({
    query,
    per_page: "10",
    orientation: "landscape"
  });
  const response = await fetch(`https://api.pexels.com/v1/search?${params.toString()}`, {
    headers: { Authorization: apiKey }
  });

  if (!response.ok) {
    throw new Error(`Pexels request failed with ${response.status}`);
  }

  const data = await response.json();
  const photos = Array.isArray(data.photos) ? data.photos : [];
  if (!photos.length) return null;

  const photo = photos[Math.abs(seed) % photos.length];
  return {
    provider: "pexels",
    source: "api",
    url: photo.src?.large2x || photo.src?.large || photo.src?.original || "",
    pageUrl: photo.url,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    attribution: photo.photographer ? `Photo by ${photo.photographer} on Pexels` : "Photo from Pexels"
  };
}

async function resolveImageSlot(slot, options) {
  const { apiKey, seed, width, height } = options;
  if (!apiKey) {
    return fallbackImage(slot.role, slot.query, slot.alt, width, height);
  }

  try {
    const found = await pexelsSearch(slot.query, apiKey, seed);
    if (found?.url) {
      return {
        ...slot,
        ...found
      };
    }
  } catch (error) {
    return {
      ...fallbackImage(slot.role, slot.query, slot.alt, width, height),
      warning: error.message
    };
  }

  return fallbackImage(slot.role, slot.query, slot.alt, width, height);
}

async function resolveStockImages(assetPlan, options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const env = { ...readEnvFile(rootDir), ...process.env };
  const apiKey = env.PEXELS_API_KEY || "";
  const seed = Number(options.seed || 0);
  const hero = await resolveImageSlot(assetPlan.images.hero, {
    apiKey,
    seed,
    width: 1200,
    height: 800
  });
  const services = [];

  for (const [index, service] of assetPlan.images.services.entries()) {
    services.push(await resolveImageSlot(service, {
      apiKey,
      seed: seed + index + 1,
      width: 800,
      height: 600
    }));
  }

  return {
    ...assetPlan,
    images: {
      ...assetPlan.images,
      provider: apiKey ? "pexels" : "unsplash-source",
      hero,
      services
    },
    notes: apiKey
      ? ["Images selected through Pexels API. Store downloaded files before production import."]
      : assetPlan.notes
  };
}

module.exports = {
  resolveStockImages
};
