# Hacker News Post

**Title:** Show HN: Free AI Image Upscaler – No Signup, No Limits, Runs in Browser

**URL:** https://upscaleimage.xyz

**First Comment (if needed):**
Hi HN,

I built UpscaleImage.AI, a free image upscaler that does all processing client-side using Canvas API with bicubic interpolation.

Technical details:
- Pure vanilla JS, no frameworks, no dependencies
- Multi-step upscaling (2× steps) for better quality at 4× and 8×
- Bicubic interpolation (Mitchell-Netravali kernel, B=C=1/3)
- All processing in the main thread with chunked execution to avoid blocking
- Zero server costs — can offer unlimited free use

The business model (if you can call it that) is SEO-driven Web出海 — building tool sites that rank for underserved keywords and monetize through ads or premium features later.

Feedback welcome on both the tool and the approach.
