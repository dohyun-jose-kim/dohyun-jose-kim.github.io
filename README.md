# 김도현 · Personal blog — v0.2.3 (React + Vite + TypeScript)

A React port of the v0.2.3 prototype. Same as v0.1.5.1 (dark/light themes, cursor
spotlight + clouds, KR/EN toggle, sticky TOC, 3D-flip Life cards, coffeehouse Contact)
**except** the Experience section, which is now a **master-detail timeline**:

- Default = compact list (year + title) on a vertical axis, the axis node sitting
  beside each subtitle.
- Click anything (or the **Expand** button / bottom hint) → the rail slides left, the
  axis node rises, the **detail heading slides left → right** (same element, same
  font/width — it travels, it doesn't cross-fade), and the bullet points arrive in a
  **staggered cascade** (and leave in reverse order). One toggle controls the whole
  section (it's view-everything, not per-row).
- Experience and Life both carry a `CLICK TO EXPAND` hint, styled like the hero SCROLL hint.

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # tsc type-check + production build → dist/
npm run preview  # preview the production build
```

## Where things live

- `src/index.css` — **all theme tokens**: fonts (`--font-display/-body/-mono`) and
  the per-theme palette (`--bg`, `--fg`, `--accent`, …) + keyframes. Change colors/fonts here.
- `src/App.tsx` — the single-page component. **Tuning lives at the top:**
  - `FLIP_SCALE` / `CENTER_PULL` — Life card flip size & center-pull.
  - `EXP` — the Experience master-detail geometry (rail width, axis position in
    summary vs. detail, node Y, the moving heading's drop/width, bullet size, row
    height). Nothing is hardcoded in the markup — change these to reshape the motion.
- `src/content.ts` — **all copy**, split by language (`ko` / `en`). Experience entries
  are now `{ year, title, detailTitle, points[] }`; Life back-face text is each item's
  `detail` field. Replace the `[ … ]` placeholders.

## Still placeholder (fill in)

Experience entries (titles, detail headings, and bullet points), Life detail bodies,
and the social links (`SOCIALS` in `content.ts`).

## Deploy to GitHub Pages

`vite.config.ts` uses `base: './'` so relative asset paths work under a project
subpath. Build, then publish `dist/` (e.g. via the `gh-pages` package or a GitHub
Actions workflow).
