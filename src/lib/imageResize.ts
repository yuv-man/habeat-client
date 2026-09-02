/**
 * Downscale an image File to a compact base64 data URL before upload.
 *
 * Every user is on the Capacitor app, and the profile-photo picker returns the
 * camera's full-resolution image — several MB. The server downscales it to
 * 400x400 on receipt anyway, so sending the original is pure waste of the
 * user's cellular data and upload time (and it brushed against the request
 * body-size limit). Resizing here means the wire payload is tens of KB.
 *
 * Falls back to the original data URL if anything about the canvas path fails,
 * so a decode quirk on some device can never block saving a profile.
 */
export async function resizeImageToDataUrl(
  file: File,
  maxDimension = 512,
  quality = 0.85
): Promise<string> {
  const originalDataUrl = await readFileAsDataUrl(file);

  try {
    const img = await loadImage(originalDataUrl);

    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    // Already small enough — don't re-encode and risk quality loss for nothing.
    if (scale === 1) return originalDataUrl;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return originalDataUrl;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return originalDataUrl;
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      reader.result
        ? resolve(reader.result as string)
        : reject(new Error("Empty file read"));
    reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image decode failed"));
    img.src = dataUrl;
  });
}
