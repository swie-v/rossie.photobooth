
// KITTY PHOTOBOOTH 💗

// GET THE PAGES
const startBtn = document.getElementById("startBtn");
const welcomePage = document.querySelector(".welcome-page");
const cameraPage = document.getElementById("cameraPage");
const stripPage = document.getElementById("stripPage");

// CAMERA ELEMENTS
const video = document.getElementById("video");
const captureBtn = document.getElementById("captureBtn");
const cameraPlaceholder = document.getElementById("cameraPlaceholder");
const countdown = document.getElementById("countdown");

// PHOTO STRIP ELEMENTS
const photosContainer = document.getElementById("photosContainer");
const photoStrip = document.getElementById("photoStrip");
const retakeBtn = document.getElementById("retakeBtn");

// STICKER ELEMENTS
const stickerButtons = document.querySelectorAll(".sticker-btn");

// FRAME COLOR ELEMENTS
const frameButtons = document.querySelectorAll(".frame-btn");

// DOWNLOAD ELEMENT
const downloadBtn = document.getElementById("downloadBtn");

let stream;
let capturedPhotos = [];
let stickerCount = 0;
let isCountingDown = false;

// FRAME COLOR THEMES
const frameColors = {
    pink: {
        border: "#ffb6d2",
        outline: "#ffe0ec",
        glow: "rgba(255, 105, 180, 0.35)",
        accent: "#e75480",
        header: "#ffd6e4"
    },

    lavender: {
        border: "#c9a7ff",
        outline: "#eadcff",
        glow: "rgba(167, 130, 255, 0.4)",
        accent: "#9466cc",
        header: "#eee2ff"
    },

    blue: {
        border: "#9edcf5",
        outline: "#d9f3ff",
        glow: "rgba(100, 190, 240, 0.4)",
        accent: "#479bc5",
        header: "#dff5ff"
    },

    yellow: {
        border: "#ffe08a",
        outline: "#fff2c9",
        glow: "rgba(255, 210, 90, 0.4)",
        accent: "#d5a52c",
        header: "#fff3cc"
    },

    white: {
        border: "#e8dce2",
        outline: "#fff0f5",
        glow: "rgba(220, 190, 205, 0.5)",
        accent: "#b7839a",
        header: "#fff0f5"
    },

    hotpink: {
        border: "#ff4f9a",
        outline: "#ffb5d5",
        glow: "rgba(255, 50, 140, 0.45)",
        accent: "#e60073",
        header: "#ffc1dd"
    }
};

// CHANGE FRAME COLOR
frameButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const selectedColor = button.dataset.frame;
        const colors = frameColors[selectedColor];

        if (!colors) return;

        photoStrip.style.borderColor = colors.border;
        photoStrip.style.outlineColor = colors.outline;

        photoStrip.style.boxShadow = `
            0 0 10px ${colors.border},
            0 0 20px ${colors.glow},
            0 10px 30px rgba(150, 70, 100, 0.2)
        `;

        photoStrip.style.setProperty("--sparkle-color", colors.accent);
        photoStrip.style.setProperty("--frame-color", colors.border);

        const stripHeader = photoStrip.querySelector(".strip-header");
        const stripTitle = photoStrip.querySelector(".strip-header h3");
        const stripFooter = photoStrip.querySelector(".strip-footer");

        stripHeader.style.backgroundColor = colors.header;
        stripTitle.style.color = colors.accent;
        stripFooter.style.color = colors.accent;

        frameButtons.forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

    });

});

// START BUTTON
startBtn.addEventListener("click", async () => {

    welcomePage.style.display = "none";
    cameraPage.style.display = "block";

    try {

        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;
        cameraPlaceholder.style.display = "none";

    } catch (error) {

        console.error("Camera error:", error);

        cameraPlaceholder.innerHTML =
            "📷<p>Please allow camera access!</p>";

        cameraPlaceholder.style.display = "flex";

    }

});

// CAPTURE BUTTON WITH COUNTDOWN
captureBtn.addEventListener("click", async () => {

    if (isCountingDown) return;

    if (!video.videoWidth || !video.videoHeight) {
        alert("Camera is not ready yet. Try again!");
        return;
    }

    isCountingDown = true;
    captureBtn.disabled = true;

    try {

        countdown.style.display = "flex";

        for (let number = 3; number >= 1; number--) {

            countdown.textContent = number;

            await new Promise(resolve => setTimeout(resolve, 1000));

        }

        countdown.style.display = "none";

        const canvas = document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");

        context.translate(canvas.width, 0);
        context.scale(-1, 1);

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const photo = canvas.toDataURL("image/png");

        capturedPhotos.push(photo);

        if (capturedPhotos.length === 3) {

            cameraPage.style.display = "none";
            stripPage.style.display = "block";

            photosContainer.innerHTML = "";

            capturedPhotos.forEach((photo) => {

                const img = document.createElement("img");

                img.src = photo;

                photosContainer.appendChild(img);

            });

            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }

        }

    } catch (error) {

        console.error("Capture error:", error);

        alert("Something went wrong while capturing your photo.");

    } finally {

        countdown.style.display = "none";
        captureBtn.disabled = false;
        isCountingDown = false;

    }

});

// HELLO KITTY STICKER BUTTONS
stickerButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const stickerImage = button.dataset.sticker;

        const sticker = document.createElement("img");

        sticker.src = stickerImage;
        sticker.alt = "Hello Kitty sticker";

        sticker.classList.add("added-sticker");

        const positions = [
            { top: "20%", left: "3%" },
            { top: "38%", right: "3%" },
            { top: "58%", left: "3%" },
            { top: "78%", right: "3%" }
        ];

        const position = positions[stickerCount % positions.length];

        sticker.style.position = "absolute";
        sticker.style.width = "65px";
        sticker.style.height = "65px";
        sticker.style.objectFit = "contain";
        sticker.style.zIndex = "5";
        sticker.style.pointerEvents = "none";

        sticker.style.top = position.top;

        if (position.left) {
            sticker.style.left = position.left;
        } else {
            sticker.style.right = position.right;
        }

        photoStrip.appendChild(sticker);

        stickerCount++;

    });

});

// RETAKE BUTTON
retakeBtn.addEventListener("click", async () => {

    capturedPhotos = [];
    photosContainer.innerHTML = "";

    photoStrip.querySelectorAll(".added-sticker").forEach((sticker) => {
        sticker.remove();
    });

    stickerCount = 0;

    stripPage.style.display = "none";
    cameraPage.style.display = "block";

    try {

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;
        cameraPlaceholder.style.display = "none";

    } catch (error) {

        console.error("Camera error:", error);

        cameraPlaceholder.innerHTML =
            "📷<p>Please allow camera access!</p>";

        cameraPlaceholder.style.display = "flex";

    }

});

// CONVERT LOCAL IMAGE TO DATA URL
async function convertImageToDataURL(src) {

    // Already a data URL
    if (src.startsWith("data:")) {
        return src;
    }

    const response = await fetch(src);

    if (!response.ok) {
        throw new Error("Cannot load sticker image: " + src);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);

        reader.onerror = () => {
            reject(new Error("Image conversion failed."));
        };

        reader.readAsDataURL(blob);

    });

}

// WAIT FOR IMAGES
function waitForImages(container) {

    const images = Array.from(container.querySelectorAll("img"));

    return Promise.all(

        images.map((img) => {

            if (img.complete && img.naturalWidth > 0) {
                return Promise.resolve();
            }

            return new Promise((resolve, reject) => {

                img.onload = resolve;

                img.onerror = () => {
                    reject(new Error("Image failed to load: " + img.src));
                };

            });

        })

    );

}

// DOWNLOAD PHOTO STRIP
downloadBtn.addEventListener("click", async () => {

    const originalText = "💗 DOWNLOAD PHOTO STRIP";

    let wrapper = null;
    let exportStyle = null;

    try {

        downloadBtn.textContent = "💗 PREPARING YOUR PHOTO STRIP...";
        downloadBtn.disabled = true;

        if (typeof html2canvas === "undefined") {
            throw new Error("html2canvas library not loaded.");
        }

        // Wait for original photos and stickers
        await waitForImages(photoStrip);

        // Clone the photostrip
        const clone = photoStrip.cloneNode(true);

        const rect = photoStrip.getBoundingClientRect();

        // Create export wrapper
        wrapper = document.createElement("div");

        wrapper.style.cssText = `
            position: fixed;
            left: -10000px;
            top: 0;
            width: ${rect.width + 80}px;
            padding: 40px;
            box-sizing: border-box;
            background: transparent;
            overflow: visible;
        `;

        clone.classList.add("export-copy");

        clone.style.width = rect.width + "px";
        clone.style.height = "auto";
        clone.style.position = "relative";
        clone.style.left = "auto";
        clone.style.top = "auto";
        clone.style.margin = "0";
        clone.style.transform = "none";
        clone.style.overflow = "visible";

        // Disable pseudo-elements in exported copy
        exportStyle = document.createElement("style");

        exportStyle.textContent = `
            .photo-strip.export-copy::before,
            .photo-strip.export-copy::after {
                content: none !important;
                display: none !important;
            }
        `;

        document.head.appendChild(exportStyle);

        // Convert cloned images to safe data URLs
        const clonedImages = Array.from(clone.querySelectorAll("img"));

        for (const img of clonedImages) {

            const originalSrc = img.getAttribute("src");

            if (originalSrc && !originalSrc.startsWith("data:")) {

                const safeImage = await convertImageToDataURL(
                    new URL(originalSrc, document.baseURI).href
                );

                img.src = safeImage;

            }

        }

        // Add top sparkles and ribbon
        const topDecoration = document.createElement("div");

        topDecoration.textContent = "✨ 🎀 ✨";

        topDecoration.style.cssText = `
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 23px;
            white-space: nowrap;
            z-index: 10;
            pointer-events: none;
        `;

        clone.appendChild(topDecoration);

        // Add bottom hearts
        const bottomDecoration = document.createElement("div");

        bottomDecoration.textContent = "✧  ♡  ✧";

        bottomDecoration.style.cssText = `
            position: absolute;
            bottom: -32px;
            left: 50%;
            transform: translateX(-50%);
            color: var(--sparkle-color);
            font-size: 23px;
            white-space: nowrap;
            z-index: 10;
            pointer-events: none;
        `;

        clone.appendChild(bottomDecoration);

        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);

        // Wait for all cloned images
        await waitForImages(wrapper);

        // Convert photostrip into canvas
        const canvas = await html2canvas(wrapper, {

            scale: 2,
            backgroundColor: null,
            useCORS: true,
            allowTaint: false,
            logging: false,

            width: rect.width + 80,
            height: clone.offsetHeight + 80,

            windowWidth: Math.max(
                document.documentElement.clientWidth,
                rect.width + 80
            )

        });

        // Convert canvas into PNG
        const blob = await new Promise((resolve, reject) => {

            canvas.toBlob((result) => {

                if (result) {
                    resolve(result);
                } else {
                    reject(new Error("Could not create PNG image."));
                }

            }, "image/png");

        });

        // Download image
        const imageURL = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = imageURL;
        link.download = "image.png";

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(imageURL);
        }, 2000);

    } catch (error) {

        console.error("Download error:", error);

        alert(
            "Download failed, beh! Please check the Console for the exact error."
        );

    } finally {

        if (wrapper) {
            wrapper.remove();
        }

        if (exportStyle) {
            exportStyle.remove();
        }

        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;

    }

});







