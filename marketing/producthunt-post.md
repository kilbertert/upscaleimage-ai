# ProductHunt — 最终版

## Tagline
Upscale images up to 8× — runs entirely in your browser, nothing uploaded

## Description
A free image upscaler that uses bicubic interpolation to enlarge images up to 8×. All processing happens locally in your browser using JavaScript and the Canvas API — your images never leave your device.

**Why we built this:**
Every image upscaler we tried had some catch: signup required, 5 images per day limit, watermarks, or your images get uploaded to unknown servers. We wanted a tool that just works — no friction, no privacy concerns.

**How it works:**
Uses bicubic interpolation (Mitchell-Netravali kernel) with a multi-step approach for better quality. Instead of upscaling 8× in one step, it does three sequential 2× steps — each step's kernel operates on neighboring pixels, producing significantly sharper results.

**Features:**
- 2×, 4×, 8× upscale with bicubic interpolation
- Supports PNG, JPG, WebP
- Before/after comparison slider
- No signup, no watermarks, no limits
- Client-side processing — complete privacy
- Works on desktop and mobile
- Dark theme, modern UI

## First Comment
Hey Product Hunt! 👋

I built this because I was frustrated with existing image upscalers. Every "free" tool had some hidden catch — signup walls, daily caps, watermarks, or sketchy privacy practices.

My approach: do everything in the browser using vanilla JavaScript and the Canvas API. No servers, no uploads, no limits.

The technical challenge was making bicubic interpolation produce good results at high scale factors. The breakthrough was using a multi-step approach — instead of one 8× step, three sequential 2× steps. Each step's bicubic kernel operates on a denser grid, preserving much more local detail.

The trade-off is that client-side processing can't match the quality of server-side neural networks like Real-ESRGAN. But for most use cases (web images, social media, quick enlargements, print preparation), the results are surprisingly good.

Would love your feedback on the tool and what features you'd like to see next!

## Topics
- Artificial Intelligence
- Design Tools  
- Developer Tools
- Free
- Privacy

## Gallery Images Needed
1. Hero screenshot showing the tool interface
2. Before/after comparison (side by side or slider view)
3. Feature highlights (privacy, speed, quality)
