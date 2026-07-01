# Rayan Hossain — personal research website

A fast, self-contained static site (no build step). Just HTML + CSS + JS,
so it deploys straight to GitHub Pages.

```
index.html                  ← the whole page
assets/style.css            ← all styling + light/dark themes
assets/script.js            ← attention-map lattice + interactions
assets/favicon.svg          ← "RH" monogram tab icon
assets/Rayan-Hossain-CV.pdf ← the file the "Download CV" button opens
.nojekyll                   ← tells GitHub Pages to serve files as-is
```

## Deploy to GitHub Pages (recommended: clean URL)

To get the clean address **https://rayan239.github.io/** (no `/rayan.github.io/` suffix),
the repository must be named exactly `rayan239.github.io`.

1. On GitHub, create a new repo named **`rayan239.github.io`** (Public).
2. Upload every file/folder in this folder (keep the `assets/` folder intact).
3. Go to **Settings → Pages → Build and deployment**, set **Source = Deploy from a branch**,
   **Branch = `main` / root**, then **Save**.
4. Wait ~1 minute, then open **https://rayan239.github.io/**.

> Prefer to keep your current repo `rayan.github.io`? That works too — the site
> uses relative links, so it will serve correctly at
> `https://rayan239.github.io/rayan.github.io/`. Just replace its old files with these.

## Add your real photo (optional)

1. Put a square photo at `assets/photo.jpg`.
2. In `index.html` find the avatar block and uncomment:
   `<!-- <img src="assets/photo.jpg" alt="Rayan Hossain" /> -->`
   (delete the `<span class="monogram">RH</span>` line if you want only the photo).

## Update the CV

Replace `assets/Rayan-Hossain-CV.pdf` with a newer export (keep the same filename),
or change the filename in the two "Download CV" links inside `index.html`.

## Change the accent color

Open `assets/style.css`, edit `--accent` (and `--accent` under `[data-theme="dark"]`).
The hero lattice uses the ML "viridis" colormap (`--v0`…`--v7`) — leave those unless
you want a different feature-map palette.
