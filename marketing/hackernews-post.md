# Hacker News — 最终版

**Title:** Show HN: Client-side image upscaler using bicubic interpolation in vanilla JS

**URL:** https://upscaleimage.xyz

**First Comment:**
Hi HN,

I built an image upscaler that runs entirely in the browser using vanilla JavaScript and the Canvas API. No server processing, no frameworks, no dependencies.

**Technical approach:**
- Bicubic interpolation (Mitchell-Netravali kernel, B=C=1/3) implemented from scratch over pixel arrays
- Multi-step upscaling: instead of one 8× step, I do three sequential 2× steps. Each step's bicubic kernel operates on a denser grid, which preserves local detail much better
- Chunked processing with `setTimeout(0)` to keep the UI responsive during computation

**The multi-step finding:**
Direct 8× upscaling produces blurry results because the 4×4 bicubic kernel samples from a very sparse grid in the source image. Three 2× steps means each kernel operates on neighboring pixels, producing significantly sharper output. The improvement is most noticeable on images with text or fine textures.

**Performance characteristics:**
- 2× upscale: near-instant (<1s for typical photos)
- 4× upscale: 1-5 seconds
- 8× upscale: 10-30 seconds (depends on device and image size)
- Main bottleneck: `getImageData()` allocates ~64MB for a 4000×4000 RGBA canvas

**Current limitations:**
- No neural network, so it can't generate new detail (won't match Real-ESRGAN quality)
- Main thread blocking on large images (Web Workers with OffscreenCanvas would be better)
- Browser-specific canvas size limits (Chrome ~16384px, Firefox ~11180px)

The site is a static HTML/CSS/JS deployment on GitHub Pages. Zero server costs, zero dependencies.

Feedback welcome on the interpolation approach or the chunked processing strategy.
