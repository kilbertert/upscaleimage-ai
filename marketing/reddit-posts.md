# Reddit Posts — 最终版

---

## Post 1: r/webdev (周六发，Showoff Saturday flair)

**标题:** I implemented bicubic interpolation in vanilla JS for image upscaler — the multi-step trick that improved quality significantly

**正文:**
I've been experimenting with client-side image processing and built an image upscaler using only the Canvas API. Wanted to share a technical finding that made a bigger difference than I expected.

**The problem with direct 8× upscaling:**
When you upscale an image 8× in one step using bicubic interpolation, the kernel is sampling from a very sparse grid. The 4×4 neighborhood used by bicubic covers a huge area in the source image, and the result tends to look overly smooth — almost like a Gaussian blur.

**The multi-step approach:**
Instead of one 8× step, I do three sequential 2× steps. Each step operates on a denser grid:

```javascript
// Single 8× step: kernel samples from far-apart pixels
// Source pixel at (x,y) maps to destination (x*8, y*8)
// The 4×4 kernel covers source pixels spread over 8 units

// Three 2× steps: each kernel operates on neighboring pixels
// Step 1: 100×100 → 200×200 (kernel covers 2-unit radius)
// Step 2: 200×200 → 400×400 (kernel covers 2-unit radius)  
// Step 3: 400×400 → 800×800 (kernel covers 2-unit radius)
```

Each step's bicubic kernel samples from nearby pixels, which means it can better preserve local detail. The intermediate steps act as a form of progressive refinement.

**The chunked processing challenge:**
Processing a 4000×4000 pixel image means 16 million pixel calculations with a 4×4 kernel each (256 multiplications per pixel). That's ~4 billion floating point operations. On the main thread, this blocks the UI for 10-30 seconds.

I initially tried `setTimeout(0)` to yield every N rows, but the overhead of re-entering the event loop adds ~0.5ms per yield. With 4000 rows and yielding every 100, that's 20ms of pure overhead.

The better approach (which I haven't implemented yet) would be Web Workers with OffscreenCanvas, but browser support for the Canvas context in workers is still inconsistent.

**What I learned:**
1. `getImageData()` on large canvases allocates a lot of memory — a 4000×4000 RGBA image is 64MB
2. The Mitchell-Netravali kernel (B=1/3, C=1/3) gives the best balance of sharpness and ringing for general-purpose upscaling
3. Canvas has undocumented max size limits that vary by browser (Chrome ~16384px, Firefox ~11180px)

Happy to discuss the interpolation math or the memory optimization approach.

---

## Post 2: r/SideProject (任何时间)

**标题:** Built a client-side image upscaler as an SEO experiment — here's the keyword research approach

**正文:**
I wanted to test whether building a simple tool site with good SEO could rank on Google without any existing domain authority.

**The project:** A browser-based image upscaler using Canvas API with bicubic interpolation. No server processing — everything runs in the user's browser.

**The SEO experiment:**
I started with keyword research using Google Autocomplete API. When you type "image upscaler ai free" into Google, the autocomplete suggestions reveal what people actually search for:
- "image upscaler ai free no sign up"
- "image upscaler ai free no login"  
- "image upscaler ai free unlimited"

These long-tail keywords tell a story: people want free image upscalers, but every existing tool has some catch (signup required, daily limits, etc). That's the gap.

**What I built:**
- Main tool page targeting the primary keyword
- 5 blog posts targeting related long-tail queries
- FAQ schema markup for Google's featured snippets
- Structured data (WebApplication schema)
- Sitemap, robots.txt, canonical URLs

**Technical implementation:**
- Vanilla JS, no frameworks (fastest possible page load)
- Bicubic interpolation with multi-step upscaling
- Before/after comparison slider
- Drag and drop file upload

**Early results:**
- Deployed on GitHub Pages (zero hosting cost)
- Google Search Console shows the site is indexed
- Core Web Vitals are all green

The site is at https://upscaleimage.xyz

I'm curious what others think about this approach — is there still opportunity in building simple tool sites for SEO, or is it too competitive now?

---

## Post 3: r/InternetIsBeautiful (任何时间)

**标题:** A browser-based image upscaler — all processing happens locally, nothing uploaded

**正文:**
https://upscaleimage.xyz

Upscales images up to 8× using JavaScript. No servers involved — your images stay on your device the entire time. No signup, no watermarks, no daily limits.

Uses bicubic interpolation with a multi-step approach for better quality. Works with PNG, JPG, and WebP.

---

## Post 4: r/privacy (任何时间)

**标题:** Most "free" image upscalers upload your photos to their servers — I built one that doesn't

**正文:**
I built an image upscaler that processes everything client-side using JavaScript and the HTML5 Canvas API. No images are uploaded to any server.

Why this matters:
- Most "free" image upscalers upload your images to their servers for processing
- You have no control over what happens to those images after processing
- Some services retain images for model training
- Even if they delete images immediately, the upload itself is a privacy risk

With client-side processing, your images stay on your device the entire time. The trade-off is slightly lower quality compared to server-side neural networks, but for most use cases (web images, social media, quick enlargements) it's more than adequate.

The tool is at https://upscaleimage.xyz — you can verify the client-side claim by opening DevTools Network tab while using it. No image data is transmitted.

---

## 通用发布建议

**发布时间：**
- 美国东部时间周二到周四上午 8-11 点最佳
- r/webdev 必须周六

**发布后：**
- 积极回复每一条评论
- 如果有人问技术细节，详细回答
- 如果有人批评，感谢反馈并说明改进方向
- 不要争论，不要防御

**避免：**
- 不要在评论里反复提链接
- 不要说"请upvote"或"请分享"
- 不要用营销话术（"revolutionary"、"game-changing"）
- 不要在多个subreddit同时发同一内容（会被shadowban）
