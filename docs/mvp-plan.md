# wp-factory MVP Plan

## Phase 1: Local Prototype

Build confidence before connecting hosting.

Deliverables:
- domain CSV input
- project schema
- deterministic brand kit generation
- reusable copy pool
- template composition selection
- static preview renderer
- basic QA report

Success criteria:
- 5 domains generate in one command
- each site has different colors, fonts, section variants, and copy
- no placeholders
- required pages are represented in `site.json`
- QA passes or reports clear failures

## Phase 2: WordPress Export

Convert `site.json` into WordPress-ready output.

Preferred initial options:
- Elementor JSON/template import if matching the current example stack
- WordPress block markup export for cleaner long-term automation

Decision needed:
- keep OceanWP + Elementor for speed
- or start block-theme export for lower long-term complexity

## Phase 3: Staging Import

Add guarded import to a staging WordPress site.

Requirements:
- dry run
- target site confirmation
- backup/export before overwrite
- deployment log
- no production deployment without explicit approval

## Phase 4: Batch Production

Scale from 5 to 50 to 200 per week.

Requirements:
- resume failed batch
- retry failed site
- recent-usage tracking
- screenshot QA
- production dashboard/report
