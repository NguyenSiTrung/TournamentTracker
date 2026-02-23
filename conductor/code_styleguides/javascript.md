# JavaScript Style Guide

## Module Pattern
- Use IIFE/Revealing Module pattern: `const Module = (() => { ... return { publicApi }; })();`
- Keep modules self-contained; expose only public API via return object
- One module per file

## Naming
- `camelCase` for variables, functions, parameters
- `PascalCase` for module names (e.g., `Store`, `Session`, `Teams`)
- `UPPER_SNAKE_CASE` for constants (e.g., `STORAGE_KEY`)
- Prefix boolean variables with `is`, `has`, `should`

## Functions
- Prefer `function` declarations inside modules for hoisting
- Use arrow functions for callbacks and short expressions
- Keep functions small and single-purpose

## DOM
- Use `document.getElementById()` for single elements
- Use `document.querySelectorAll()` for collections
- Cache DOM references when accessed repeatedly
- Use `escapeHtml()` for all user-provided content in innerHTML

## General
- Use `const` by default, `let` when reassignment needed, never `var`
- Use template literals for string interpolation
- Use strict equality (`===` / `!==`)
- No semicolon-free style — always use semicolons
