# Stock Images

Generated sites include one hero image slot and three service image slots.

## Development Mode

If no API key is configured, `wp-factory` uses temporary Unsplash Source URLs for previews.

This is good enough for local preview work, but not for production WordPress imports because those URLs are not saved, licensed, or stable.

## Pexels Mode

Add a Pexels API key to `.env`:

```text
PEXELS_API_KEY=your_key_here
```

Then run:

```bash
node scripts/batch-run.js --input batches/week-01-sample.csv --limit 5
```

The generated `site.json` files will include selected Pexels image URLs, page URLs, photographer names, and attribution text.

## Production Rule

Before importing into WordPress, production should download selected images into the generated export package and keep attribution/license metadata with the site package.
