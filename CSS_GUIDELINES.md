# CSS Guidelines

This project follows a small, consistent subset of https://cssguidelin.es/ to keep styles predictable and easy to extend without changing the UI.

## Rules we enforce
- 2-space indentation; multi-line rules only.
- Stable property order: positioning → display/flex/grid → box model → border → background/visual → typography → misc (e.g., transitions).
- Class-only selectors; no IDs; avoid element-qualifying selectors (e.g., `button.btn`).
- Shallow selector depth (component internals only, usually one level).
- BEM-like naming: `block__element--modifier` with hyphen-delimited block names.
- No `!important` (utilities should not rely on it).
- Inline styles only for dynamic values (e.g., computed sizes).
- Keep page-specific rules out of global component styles.
- Remove dead/unused CSS when refactoring.
- Large CSS files include a short TOC and section notes.

## Structure
- `frontend/src/styles/index.css`: base styles, layout objects, shared components, utilities.
- `frontend/src/styles/pages.css`: page-level layouts, shared page header/footer, page-specific overrides.
- `frontend/src/styles/font.css`: font imports and weight/style helpers.

Imports are wired in `frontend/src/main.tsx` in a stable order.

## Utilities and shared patterns
- Layout helpers: `.page-center`, `.page-stack`, `.stack`, `.grid`, `.grid--two`.
- Shared page bits: `.page__content`, `.page__footer`, `.page__footer-link`, `.page__footer--sm`, `.page__footer--xs`, `.page__footer--spaced`, `.page__footer--inverse`.
- Text helpers: `.heading`, `.heading--xl`, `.muted`, `.eyebrow`.

## Do / Don't
1) Do use `block__element--modifier` naming; don't invent new casing styles.
2) Do keep selectors flat; don't nest more than one level.
3) Do keep property order consistent; don't mix ordering per file.
4) Do group by responsibility with TOC comments; don't dump rules at the end.
5) Do reuse utilities for spacing/size; don't duplicate per page.
6) Do keep global styles in `index.css`; don't put page overrides there.
7) Do keep page-specific rules in `pages.css`; don't scatter them across files.
8) Do avoid `!important`; don't add it as a quick fix.
9) Do prefer class selectors; don't style via IDs or tag-qualified selectors.
10) Do keep inline styles only for dynamic values; don't use them for static layout.

## Notes / compromises
- The Logo keeps an inline `style` for dynamic sizing; moving it to CSS would remove the size prop behavior.
