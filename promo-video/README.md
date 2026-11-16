# Enginara promotional films
Current cinematic revision: `out/enginara-cinematic-60s.mp4`, 60 seconds, 1080p landscape, with original sound design. See the cinematic revision section below for its timeline and reproduction commands.

## Original 30-second version

1920 × 1080, 30 fps, 900 frames. Music only.

Final output: `out/enginara-promo-30s.mp4`.

## Edit and reproduce

Run the website on http://localhost:3000 from the repository root (`npm run dev`). In this folder:

```powershell
npm install
npm run capture
npm run encode
npm run dev
npm run check
npm run render -- --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

The capture uses an isolated headless Chrome renderer at 1920 × 1080. It advances browser time and scroll position at 30 fps, recording the actual Three.js, GSAP, CSS, and demo animations. The site's source is not modified. Capture requires locally installed Google Chrome.

## Edit timing

- 0–3s: opening pencil drawing and introduction.
- 3–9.5s: exploded laptop, component assembly, and screen entry.
- 9.5–14.5s: build chapter and service diagrams.
- 14.5–26.5s: build demo, connected workflow, capabilities, care, and delivery process.
- 26.5–30s: custom animated brand close, email CTA, and music fade.

The promo covers the main scrolling narrative. Optional component-inspection interactions, alternate demo selections, and the separate pricing page are outside this 30-second edit.

`capture.mjs` owns the scroll choreography. `src/Composition.tsx` owns the video and music timeline. `src/Closing.tsx` owns the closing card. The footage and captured JPEGs are ignored by Git and can be regenerated.

## Assets

- Site footage, Enginara mark, brand colors, and Sora font come from this project.
- Music: Inspired Ambient, `inspired-ambient-141686.mp3`, bundled with the promo-video skill and identified there as royalty-free Pixabay music.
- Closing contact: `info@enginara.tech`, taken from the website. No unconfirmed public website URL is added.

## Cinematic revision — 60 seconds

Final output: `out/enginara-cinematic-60s.mp4`.
Studio composition: `Enginara-Cinematic`.

This edit uses the original eight-second drawing without the website container's crop, then holds the fully drawn wordmark. Dedicated shots replace the continuous scroll recording. Navigation and playback controls are hidden only in the capture browser. Slow camera movement, longer chapter holds and soft dissolves retain the website's paper, graphite, warm orange and dark technical palette.

- 0–10s: full pencil drawing and completed-logo hold.
- 9.3–27.8s: slower physical assembly, keyboard seating and screen entry.
- 27–36s: identity and service-system chapters.
- 35.2–55.2s: build, connect, expand, care and approach, each with a hold.
- 54.4–60s: closing brand signature.

Overlapping times are intentional dissolves. The composition is exactly 1,800 frames at 30 fps.

The new soundtrack, **Graphite / Circuit**, is an original synthesized score created by `score.py`: sparse damped resonances, sustained open harmonies, graphite-like friction, quiet mechanical ticks and stereo room reflections. It uses no stock music or external samples. The final mix is reduced by 1.94 dB from the source, with a gentle 3.4-second ending fade.

```powershell
npm run capture:cinematic
npm run encode:cinematic
npm run score
npm run check
npm run render:cinematic -- --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

Score generation needs Python with NumPy. The original 30-second version remains available for comparison.

