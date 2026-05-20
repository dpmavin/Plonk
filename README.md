# Plonk

Sketch your ideas. Hear them plonk.

A browser-based hand-tracked creative tool. Draw with a pinch gesture on a linen canvas; each pastel color plays a distinct instrument in real time.

## Stack

- React 19 + Vite 8
- [@mediapipe/hands](https://www.npmjs.com/package/@mediapipe/hands) for hand tracking
- [Tone.js](https://tonejs.github.io/) for real-time audio synthesis

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. The first interaction unlocks the audio context; granting webcam permission unlocks hand tracking.

### Dev-only specs page

In development, append `?specs` to the URL to see a table of color → instrument mappings, audio cues, and prompts.

## Build

```bash
npm run build
npm run preview
```

The dist output is fully static (~700 KB) and can be hosted on any static host. Webcam access requires HTTPS (or localhost) in modern browsers.

## Deploy to Vercel

1. Push to GitHub.
2. In Vercel, "New Project" → import the repo.
3. Framework preset: **Vite**. Build command: `npm run build`. Output dir: `dist`.
4. After deploy, open the production URL and grant camera permission.

## Lint

```bash
npm run lint
```
