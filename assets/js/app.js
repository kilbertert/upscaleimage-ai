/**
 * UpscaleImage.AI — Application Logic
 * Handles UI interactions, file upload, comparison slider
 */

(function() {
    'use strict';

    const upscaler = new ImageUpscaler();
    let currentScale = 2;
    let currentFileName = '';

    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const editorArea = document.getElementById('editorArea');
    const canvasOriginal = document.getElementById('canvasOriginal');
    const canvasUpscaled = document.getElementById('canvasUpscaled');
    const compSlider = document.getElementById('compSlider');
    const compBefore = document.getElementById('compBefore');
    const processing = document.getElementById('processing');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const origSize = document.getElementById('origSize');
    const outSize = document.getElementById('outSize');
    const scaleBtns = document.querySelectorAll('.scale-btn');

    // ===== File Upload =====
    
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // ===== File Handling =====

    async function handleFile(file) {
        // Validate file
        const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a PNG, JPG, or WebP image.');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            alert('File size must be under 50MB.');
            return;
        }

        try {
            currentFileName = file.name;
            const info = await upscaler.loadImage(file);
            
            // Show editor
            dropZone.classList.add('hidden');
            editorArea.classList.remove('hidden');

            // Draw original
            upscaler.drawOriginal(canvasOriginal);

            // Update info
            origSize.textContent = `${info.width}×${info.height}`;
            updateOutputInfo();

            // Auto-upscale
            performUpscale();
        } catch (err) {
            alert('Failed to load image: ' + err.message);
        }
    }

    // ===== Scale Selection =====

    scaleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            scaleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentScale = parseInt(btn.dataset.scale);
            updateOutputInfo();
            performUpscale();
        });
    });

    function updateOutputInfo() {
        const dims = upscaler.getOutputDimensions(currentScale);
        if (dims) {
            outSize.textContent = `${dims.width}×${dims.height}`;
        }
    }

    // ===== Upscale =====

    async function performUpscale() {
        if (!upscaler.originalImage || upscaler.isProcessing) return;

        // Show processing, hide comparison
        document.getElementById('comparisonContainer').classList.add('hidden');
        processing.classList.remove('hidden');
        downloadBtn.disabled = true;
        progressFill.style.width = '0%';
        progressText.textContent = '0%';

        try {
            await upscaler.upscale(canvasUpscaled, currentScale, (progress) => {
                progressFill.style.width = progress + '%';
                progressText.textContent = progress + '%';
            });

            // Show comparison
            processing.classList.add('hidden');
            document.getElementById('comparisonContainer').classList.remove('hidden');
            downloadBtn.disabled = false;

            // Reset slider to middle
            moveSlider(50);
        } catch (err) {
            processing.classList.add('hidden');
            document.getElementById('comparisonContainer').classList.remove('hidden');
            alert('Upscaling failed: ' + err.message);
        }
    }

    // ===== Comparison Slider =====

    let isDragging = false;

    function moveSlider(percent) {
        percent = Math.max(0, Math.min(100, percent));
        compSlider.style.left = percent + '%';
        compBefore.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    }

    function getPercent(e) {
        const rect = document.getElementById('comparisonContainer').getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        return ((clientX - rect.left) / rect.width) * 100;
    }

    compSlider.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });

    compSlider.addEventListener('touchstart', (e) => {
        isDragging = true;
    }, { passive: true });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            moveSlider(getPercent(e));
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            moveSlider(getPercent(e));
        }
    }, { passive: true });

    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('touchend', () => isDragging = false);

    // Also allow clicking on comparison area to jump slider
    document.getElementById('comparisonContainer').addEventListener('click', (e) => {
        if (!isDragging) {
            moveSlider(getPercent(e));
        }
    });

    // ===== Download =====

    downloadBtn.addEventListener('click', () => {
        const baseName = currentFileName.replace(/\.[^.]+$/, '');
        upscaler.downloadResult(`${baseName}-${currentScale}x-upscaled.png`);
    });

    // ===== Reset =====

    resetBtn.addEventListener('click', () => {
        editorArea.classList.add('hidden');
        dropZone.classList.remove('hidden');
        fileInput.value = '';
        downloadBtn.disabled = true;
        upscaler.originalImage = null;
        currentFileName = '';
    });

    // ===== Smooth Scroll for Anchor Links =====
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ===== Keyboard Shortcuts =====
    
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S to download
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            if (!downloadBtn.disabled) {
                e.preventDefault();
                downloadBtn.click();
            }
        }
        // Escape to reset
        if (e.key === 'Escape' && !editorArea.classList.contains('hidden')) {
            resetBtn.click();
        }
    });

    // ===== Service Worker for PWA (optional) =====
    // if ('serviceWorker' in navigator) {
    //     navigator.serviceWorker.register('/sw.js');
    // }

})();
