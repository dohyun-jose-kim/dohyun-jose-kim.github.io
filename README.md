# dohyun-jose-kim.github.io

Personal site of **Dohyun Kim** — a single-page React app (dark/light, KR/EN),
built with **Vite + React + TypeScript** and deployed to **GitHub Pages**.

🔗 https://dohyun-jose-kim.github.io

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build → dist/
npm run preview  # preview the production build
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and publishes `dist/` to GitHub Pages automatically.

## Where things live

- `src/content.ts` — all copy, split by language (`ko` / `en`).
- `src/App.tsx` — the single-page component; layout/interaction tuning constants
  (`EXP`, `FLIP_SCALE`, `CENTER_PULL`) live at the top.
- `src/index.css` — theme tokens (fonts + per-theme palette).
