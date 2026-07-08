/**
 * UpscaleImage.AI — Image Upscaler Engine
 * Client-side image upscaling using Canvas API with bicubic interpolation
 */

class ImageUpscaler {
    constructor() {
        this.originalImage = null;
        this.originalCanvas = null;
        this.upscaledCanvas = null;
        this.scaleFactor = 2;
        this.isProcessing = false;
    }

    /**
     * Load image from File object
     */
    async loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.originalImage = img;
                    resolve({
                        width: img.width,
                        height: img.height,
                        size: file.size,
                        name: file.name,
                        type: file.type
                    });
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Draw original image to canvas
     */
    drawOriginal(canvas) {
        if (!this.originalImage) return;
        this.originalCanvas = canvas;
        canvas.width = this.originalImage.width;
        canvas.height = this.originalImage.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.originalImage, 0, 0);
    }

    /**
     * Main upscale method — uses multi-step approach for quality
     */
    async upscale(targetCanvas, scaleFactor, onProgress) {
        if (!this.originalImage) throw new Error('No image loaded');
        
        this.isProcessing = true;
        this.scaleFactor = scaleFactor;
        this.upscaledCanvas = targetCanvas;

        const srcW = this.originalImage.width;
        const srcH = this.originalImage.height;
        const dstW = srcW * scaleFactor;
        const dstH = srcH * scaleFactor;

        // For 8x, do it in steps (2x then 4x, or 2x 2x 2x) for better quality
        const steps = this._getScaleSteps(scaleFactor);
        
        let currentSrc = this._imageToCanvas(this.originalImage);
        
        for (let i = 0; i < steps.length; i++) {
            const stepScale = steps[i];
            const stepDstW = currentSrc.width * stepScale;
            const stepDstH = currentSrc.height * stepScale;
            
            // Use offscreen canvas for intermediate steps
            const stepCanvas = document.createElement('canvas');
            stepCanvas.width = stepDstW;
            stepCanvas.height = stepDstH;
            
            await this._upscaleStep(currentSrc, stepCanvas, stepScale, (stepProgress) => {
                const overallProgress = ((i + stepProgress) / steps.length) * 100;
                if (onProgress) onProgress(Math.min(99, Math.round(overallProgress)));
            });
            
            currentSrc = stepCanvas;
            
            // Yield to main thread
            await new Promise(r => setTimeout(r, 10));
        }

        // Draw final result to target canvas
        targetCanvas.width = dstW;
        targetCanvas.height = dstH;
        const ctx = targetCanvas.getContext('2d');
        ctx.drawImage(currentSrc, 0, 0);

        this.isProcessing = false;
        if (onProgress) onProgress(100);

        return { width: dstW, height: dstH };
    }

    /**
     * Break scale factor into incremental steps for quality
     */
    _getScaleSteps(totalScale) {
        switch (totalScale) {
            case 2: return [2];
            case 4: return [2, 2];
            case 8: return [2, 2, 2];
            default: return [totalScale];
        }
    }

    /**
     * Single upscale step using bicubic interpolation via canvas
     */
    async _upscaleStep(srcCanvas, dstCanvas, scale, onProgress) {
        const srcW = srcCanvas.width;
        const srcH = srcCanvas.height;
        const dstW = dstCanvas.width;
        const dstH = dstCanvas.height;

        const srcCtx = srcCanvas.getContext('2d');
        const dstCtx = dstCanvas.getContext('2d');

        // Get source image data
        const srcData = srcCtx.getImageData(0, 0, srcW, srcH);
        const dstData = dstCtx.createImageData(dstW, dstH);

        const src = srcData.data;
        const dst = dstData.data;

        // Process in chunks for progress updates and non-blocking
        const chunkSize = Math.max(1, Math.floor(dstH / 20));
        
        for (let yStart = 0; yStart < dstH; yStart += chunkSize) {
            const yEnd = Math.min(yStart + chunkSize, dstH);
            
            for (let dy = yStart; dy < yEnd; dy++) {
                for (let dx = 0; dx < dstW; dx++) {
                    // Map destination pixel to source coordinates
                    const srcX = dx / scale;
                    const srcY = dy / scale;

                    // Bicubic interpolation
                    const [r, g, b, a] = this._bicubicInterpolate(src, srcW, srcH, srcX, srcY);

                    const idx = (dy * dstW + dx) * 4;
                    dst[idx]     = r;
                    dst[idx + 1] = g;
                    dst[idx + 2] = b;
                    dst[idx + 3] = a;
                }
            }

            // Update progress and yield
            if (onProgress) {
                onProgress(yEnd / dstH);
            }
            
            // Yield to main thread every chunk
            if (yStart % (chunkSize * 3) === 0) {
                await new Promise(r => setTimeout(r, 0));
            }
        }

        dstCtx.putImageData(dstData, 0, 0);
    }

    /**
     * Bicubic interpolation kernel (Mitchell-Netravali, B=1/3, C=1/3)
     */
    _bicubicKernel(x) {
        const absX = Math.abs(x);
        const absX2 = absX * absX;
        const absX3 = absX2 * absX;

        if (absX <= 1) {
            return (12/9 * absX3) - (18/9 * absX2) + (6/9);
        } else if (absX < 2) {
            return (-4/9 * absX3) + (18/9 * absX2) - (30/9 * absX) + (16/9);
        }
        return 0;
    }

    /**
     * Bicubic interpolation for a single pixel
     */
    _bicubicInterpolate(src, srcW, srcH, fx, fy) {
        const x = Math.floor(fx);
        const y = Math.floor(fy);
        const dx = fx - x;
        const dy = fy - y;

        let r = 0, g = 0, b = 0, a = 0;

        // 4x4 kernel
        for (let m = -1; m <= 2; m++) {
            for (let n = -1; n <= 2; n++) {
                const px = Math.min(Math.max(x + n, 0), srcW - 1);
                const py = Math.min(Math.max(y + m, 0), srcH - 1);
                const idx = (py * srcW + px) * 4;

                const weight = this._bicubicKernel(dx - n) * this._bicubicKernel(dy - m);

                r += src[idx]     * weight;
                g += src[idx + 1] * weight;
                b += src[idx + 2] * weight;
                a += src[idx + 3] * weight;
            }
        }

        return [
            Math.max(0, Math.min(255, Math.round(r))),
            Math.max(0, Math.min(255, Math.round(g))),
            Math.max(0, Math.min(255, Math.round(b))),
            Math.max(0, Math.min(255, Math.round(a)))
        ];
    }

    /**
     * Convert Image to Canvas
     */
    _imageToCanvas(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas;
    }

    /**
     * Download the upscaled image
     */
    downloadResult(filename = 'upscaled-image.png') {
        if (!this.upscaledCanvas) return;
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.upscaledCanvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Get estimated output dimensions
     */
    getOutputDimensions(scaleFactor) {
        if (!this.originalImage) return null;
        return {
            width: this.originalImage.width * scaleFactor,
            height: this.originalImage.height * scaleFactor
        };
    }

    /**
     * Format file size for display
     */
    static formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    /**
     * Format dimensions for display
     */
    static formatDimensions(w, h) {
        return `${w} × ${h} px`;
    }
}

// Export for use in app.js
window.ImageUpscaler = ImageUpscaler;
