# HTML Style Guide

## Structure
- Semantic elements: `<header>`, `<nav>`, `<main>`, `<section>`
- 4-space indentation
- Self-closing tags not required for void elements

## Attributes
- Use `id` for JavaScript hooks (e.g., `id="btn-create-team"`)
- Use `class` for styling
- Use `data-*` attributes for JS data binding (e.g., `data-tab="dashboard"`)
- Double quotes for attribute values

## Accessibility
- Include `lang` attribute on `<html>`
- Add `title` attributes to icon-only buttons
- Use `<label>` elements for form inputs
- Ensure `<meta name="viewport">` is set for responsive

## Conventions
- Scripts at bottom of `<body>`, loaded in dependency order
- External CSS in `<head>` via `<link>`
- No inline styles except for dynamic show/hide (`style="display:none"`)
