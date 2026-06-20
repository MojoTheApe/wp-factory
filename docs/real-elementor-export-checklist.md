# Real Elementor Export Checklist

Use this when we get access to a temporary WordPress install.

## Goal

Create one real OceanWP + Elementor template package that replaces the current placeholder package.

## WordPress Setup

Install:

- OceanWP theme
- Elementor
- Header Footer Elementor
- Ocean Extra
- GTranslate, optional
- WPForms Lite, optional

## Build One Base Site

Create these pages:

- Home
- About Us
- Services
- Contact
- Privacy Policy
- Terms and Conditions
- Cookie Policy

Use obvious placeholders:

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
```

## Export

Export Elementor templates/pages as JSON where possible.

Also capture:

- theme name and version
- plugin names and versions
- any required global settings
- menu/header/footer method
- asset folder structure

## Save Into Repo

Place the raw export under:

```text
template-packages/oceanwp-elementor-agency-01/elementor-pages/
```

Keep generated outputs out of git.

## Validate

Run:

```bash
node scripts/validate-template-package.js --template template-packages/oceanwp-elementor-agency-01
node scripts/build-template-package.js --site projects/wp_puffy-paws_0001/site.json --template template-packages/oceanwp-elementor-agency-01
node scripts/validate-export-package.js --dir exports/wp_puffy-paws_0001
```
