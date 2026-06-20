# Template Package Format

Template packages are reusable website shells.

They are designed for disposable WordPress sites where we need to quickly swap:

- company name
- domain
- colors
- logo/wordmark
- fonts
- images
- copy
- legal/footer/contact text

## Folder Shape

```text
template-packages/<template-id>/
  template.json
  variables.json
  elementor-pages/
    home.json
    about.json
    services.json
    contact.json
  preview/
    index.html
```

## Placeholders

Use double-brace placeholders:

```text
{{COMPANY_NAME}}
{{DOMAIN}}
{{PRIMARY_COLOR}}
{{ACCENT_COLOR}}
{{BACKGROUND_COLOR}}
{{TEXT_COLOR}}
{{HEADING_FONT}}
{{BODY_FONT}}
{{LOGO_TEXT}}
{{HERO_TITLE}}
{{HERO_BODY}}
{{SERVICE_1_TITLE}}
{{SERVICE_1_BODY}}
```

The replacer applies placeholders to every `.json`, `.html`, `.css`, and `.txt` file in the package.

## Output

Generated exports go to:

```text
exports/<projectId>/
```

`exports/` is ignored by git because it is generated output.

## Current Status

The first package is an Elementor-style JSON placeholder package, not a real Elementor import yet.

The purpose is to lock the factory contract before hosting is ready. When we get a WordPress server, Billy will replace the fake Elementor JSON with real exported Elementor templates and keep the same variable system.

## Validation

Validate a source package:

```bash
node scripts/validate-template-package.js --template template-packages/oceanwp-elementor-agency-01
```

Validate a rendered export:

```bash
node scripts/validate-export-package.js --dir exports/wp_puffy-paws_0001
```

These checks are intentionally simple:

- required files exist
- JSON files parse
- rendered exports have no unresolved `{{VARIABLE}}` placeholders
- preview HTML exists
