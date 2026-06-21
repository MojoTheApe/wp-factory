# Restore WP Factory

Use this guide if the OpenClaw server or local workspace is lost and WP Factory needs to be restored from GitHub.

## 1. Clone The Repo

```bash
git clone https://github.com/MojoTheApe/wp-factory.git
cd wp-factory
```

This restores the reusable WP Factory source:

- generator scripts
- reusable template package files
- portable WP agent instructions in `agents/`
- sanitized OpenClaw registration example in `openclaw/`
- docs, schemas, and sample batch input

## 2. Recreate Local-Only Files

The following files and folders are intentionally not stored in GitHub:

```text
.env
projects/
exports/
logs/
tmp/
wordpress/
```

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Then fill in real local values, including `PEXELS_API_KEY` if stock-image API selection is needed.

## 3. Restore OpenClaw WP Agents

The repo stores the portable agent instructions here:

```text
agents/wp-1/
agents/wp-2/
agents/wp-3/
agents/wp-4/
agents/wp-5/
```

Copy those folders into the target OpenClaw agents directory:

```bash
mkdir -p /data/.openclaw/agents
cp -R agents/wp-* /data/.openclaw/agents/
```

Then merge the sanitized registration example into the target OpenClaw config:

```text
openclaw/wp-factory-agents.example.json
```

Adjust paths for the new machine before restarting OpenClaw:

```text
<path-to-cloned-wp-factory-repo>
<openclaw-agents-dir>
```

Expected active WP Factory agent display names:

```text
Wendy - WP Producer
Brenda - WP Brand
Cora - WP Copy
Billy - WP Builder
Quentin - WP QA
```

Do not copy real bot tokens, deploy keys, API keys, or hosting credentials into the repo.

## 4. Run Sanity Checks

```bash
node scripts/batch-run.js --input batches/week-01-sample.csv --limit 5
node scripts/validate-template-package.js --template template-packages/oceanwp-elementor-agency-01
node scripts/build-template-package.js --site projects/wp_puffy-paws_0001/site.json --template template-packages/oceanwp-elementor-agency-01
node scripts/validate-export-package.js --dir exports/wp_puffy-paws_0001
```

## 5. Reconnect GitHub Push Access

If the previous SSH deploy key is gone, create a new repo-specific key and add it to GitHub deploy keys with write access.

Then set the repo remote to the configured SSH alias:

```bash
git remote set-url origin git@github.com:MojoTheApe/wp-factory.git
```
