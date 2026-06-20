# Local WordPress Setup

Use this to create the first real OceanWP + Elementor template export.

## Requirement

Install Docker Desktop or Docker Engine on the machine where you run this repo.

This current OpenClaw environment does not have Docker installed, so the setup files are committed but not running here.

## Start WordPress

```bash
cp .env.example .env
docker compose up -d
```

Open:

```text
http://localhost:8088
```

Complete the WordPress installer in the browser.

## Install Required Stack

In WordPress admin, install:

- OceanWP theme
- Elementor
- Header Footer Elementor
- Ocean Extra

Optional:

- GTranslate
- WPForms Lite

## Create The Base Site

Create pages:

- Home
- About Us
- Services
- Contact
- Privacy Policy
- Terms and Conditions
- Cookie Policy

Use placeholders in Elementor text fields:

```text
{{COMPANY_NAME}}
{{DOMAIN}}
{{PRIMARY_COLOR}}
{{ACCENT_COLOR}}
{{HEADING_FONT}}
{{BODY_FONT}}
{{HERO_TITLE}}
{{HERO_BODY}}
{{SERVICE_1_TITLE}}
{{SERVICE_1_BODY}}
{{SERVICE_2_TITLE}}
{{SERVICE_2_BODY}}
{{SERVICE_3_TITLE}}
{{SERVICE_3_BODY}}
{{CITY}}
{{COUNTRY}}
```

## Export Elementor Templates

For each Elementor-built page:

1. Open page with Elementor.
2. Save as template.
3. Export template JSON.
4. Place exported JSON files into:

```text
template-packages/oceanwp-elementor-agency-01/elementor-pages/
```

Then run:

```bash
node scripts/validate-template-package.js --template template-packages/oceanwp-elementor-agency-01
node scripts/batch-run.js --input batches/week-01-sample.csv --limit 1
node scripts/build-template-package.js --site projects/wp_puffy-paws_0001/site.json --template template-packages/oceanwp-elementor-agency-01
node scripts/validate-export-package.js --dir exports/wp_puffy-paws_0001
```

## Useful Docker Commands

Stop:

```bash
docker compose down
```

Reset everything:

```bash
docker compose down -v
```

Run WP-CLI:

```bash
docker compose run --rm wpcli plugin list
docker compose run --rm wpcli theme list
```
