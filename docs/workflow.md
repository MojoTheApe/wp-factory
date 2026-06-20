# wp-factory Workflow

## Agent Order

```text
Wendy -> Brenda -> Cora -> Billy -> Quentin -> Wendy
```

## Batch Flow

1. Wendy receives a CSV or JSON batch.
2. Wendy normalizes each domain into a project brief.
3. Brenda creates a brand kit.
4. Cora creates a copy pack.
5. Billy builds the preview or WordPress export.
6. Quentin runs QA.
7. Wendy returns a batch summary.

## Production Rules

- Keep generated output out of git.
- Use structured JSON as the source of truth.
- Use deterministic scripts for repeated build/import/QA work.
- Use AI only for brand/copy variation and optional summaries.
- Do not deploy without explicit approval.
- Do not invent sensitive contact details.
- Avoid using the same full composition more than once in a batch.

## Current MVP Command

```bash
node scripts/batch-run.js --input batches/week-01-sample.csv --limit 5
```

Generated output goes to:

```text
projects/
```
