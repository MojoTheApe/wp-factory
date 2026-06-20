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

## Run A 5-Site Prototype

```bash
node wp-factory/scripts/batch-run.js --input wp-factory/batches/week-01-sample.csv --limit 5
```

Outputs are written to:

```text
wp-factory/projects/<projectId>/
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
2. Add real WordPress export format.
3. Add staging WordPress import.
4. Add screenshot QA.
5. Add deployment safeguards and batch resume.
