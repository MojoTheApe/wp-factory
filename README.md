# wp-factory

High-volume WordPress website production prototype.

This MVP turns a list of domains into structured site projects and static previews. It does not deploy or modify WordPress yet.

## Goal

Produce simple, clean company websites quickly and cheaply while keeping each site visually different enough for batch production.

Target planning volume: 200 websites per week.

## MVP Flow

```text
domains.csv
  -> create project
  -> generate brand kit
  -> generate copy pack
  -> select template composition
  -> render static preview
  -> run QA
```

## Template Package Flow

Reusable site templates live in `template-packages/`. They are source templates with variable placeholders.

```text
site.json + template package
  -> exports/<projectId>/
  -> ready-to-import package files
  -> preview/index.html
```

Build a package for a generated site:

```bash
node scripts/build-template-package.js \
  --site projects/wp_puffy-paws_0001/site.json \
  --template template-packages/oceanwp-elementor-agency-01
```

Validate a source template package:

```bash
node scripts/validate-template-package.js \
  --template template-packages/oceanwp-elementor-agency-01
```

Validate a rendered export package:

```bash
node scripts/validate-export-package.js \
  --dir exports/wp_puffy-paws_0001
```

## Run A 5-Site Prototype

```bash
node scripts/batch-run.js --input batches/week-01-sample.csv --limit 5
```

## Local WordPress Test Site

To create the first real OceanWP + Elementor export, use:

```bash
cp .env.example .env
docker compose up -d
```

Then open:

```text
http://localhost:8088
```

Full instructions: `docs/local-wordpress-setup.md`

## Restore / Portability

To rebuild WP Factory on another OpenClaw machine, use `RESTORE.md`.

Outputs are written to:

```text
projects/<projectId>/
```

Each project contains:

- `site.json` - structured source of truth
- `preview/index.html` - static preview
- `qa-report.json` - lightweight QA result

## Current Scope

- English only.
- Generic digital marketing / business services sites.
- Static preview generation.
- Deterministic variation without paid APIs.
- No real deployment.
- No external messaging or hosting changes.

## Next Milestones

1. Review generated 5-site previews.
2. Add real Elementor/OceanWP export format.
3. Add staging WordPress import when hosting is ready.
4. Add screenshot QA.
5. Add deployment safeguards and batch resume.
