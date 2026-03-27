import html2canvas from "html2canvas";

export interface ShareData {
  title: string;
  text: string;
  url?: string;
  image?: Blob;
}

export type SharePlatform = "twitter" | "facebook" | "whatsapp" | "copy" | "native" | "download";

/**
 * Generate an image from a DOM element using html2canvas
 */
export async function generateShareImage(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution
    backgroundColor: null,
    useCORS: true,
    logging: false,
    allowTaint: true,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to generate image"));
        }
      },
      "image/png",
      1.0
    );
  });
}

/**
 * Download an image blob as a file
 */
export function downloadImage(blob: Blob, filename: string = "habeat-achievement.png"): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Check if Web Share API is available
 */
export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}

/**
 * Check if Web Share API supports sharing files
 */
export function canShareFiles(): boolean {
  return typeof navigator !== "undefined" && !!navigator.canShare;
}

/**
 * Share using native Web Share API
 */
export async function nativeShare(data: ShareData): Promise<boolean> {
  if (!canUseNativeShare()) {
    return false;
  }

  try {
    const shareData: ShareData & { files?: File[] } = {
      title: data.title,
      text: data.text,
    };

    if (data.url) {
      shareData.url = data.url;
    }

    // Check if we can share files
    if (data.image && canShareFiles()) {
      const file = new File([data.image], "habeat-achievement.png", { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        shareData.files = [file];
      }
    }

    await navigator.share(shareData as any);
    return true;
  } catch (error) {
    // User cancelled or error occurred
    if ((error as Error).name !== "AbortError") {
      console.error("Share failed:", error);
    }
    return false;
  }
}

/**
 * Generate sharing URL for different platforms
 */
export function getShareUrl(platform: SharePlatform, data: ShareData): string {
  const encodedText = encodeURIComponent(data.text);
  const encodedUrl = data.url ? encodeURIComponent(data.url) : "";

  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encodedText}${encodedUrl ? `&url=${encodedUrl}` : ""}`;

    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}${encodedUrl ? `&u=${encodedUrl}` : ""}`;

    case "whatsapp":
      return `https://wa.me/?text=${encodedText}${encodedUrl ? ` ${encodedUrl}` : ""}`;

    default:
      return "";
  }
}

/**
 * Open share URL in new window
 */
export function openShareWindow(platform: SharePlatform, data: ShareData): void {
  const url = getShareUrl(platform, data);
  if (url) {
    window.open(url, "_blank", "width=600,height=400,menubar=no,toolbar=no");
  }
}

/**
 * Main share function that handles all platforms
 */
export async function shareContent(
  platform: SharePlatform,
  data: ShareData,
  elementRef?: HTMLElement
): Promise<{ success: boolean; message?: string }> {
  try {
    // Generate image if element is provided
    let imageBlob: Blob | undefined;
    if (elementRef) {
      imageBlob = await generateShareImage(elementRef);
      data.image = imageBlob;
    }

    switch (platform) {
      case "native":
        const nativeSuccess = await nativeShare(data);
        return { success: nativeSuccess, message: nativeSuccess ? "Shared successfully!" : "Share cancelled" };

      case "download":
        if (imageBlob) {
          downloadImage(imageBlob);
          return { success: true, message: "Image downloaded!" };
        }
        return { success: false, message: "No image to download" };

      case "copy":
        const text = data.url ? `${data.text}\n${data.url}` : data.text;
        const copied = await copyToClipboard(text);
        return { success: copied, message: copied ? "Copied to clipboard!" : "Failed to copy" };

      case "twitter":
      case "facebook":
      case "whatsapp":
        openShareWindow(platform, data);
        return { success: true, message: "Share window opened" };

      default:
        return { success: false, message: "Unknown platform" };
    }
  } catch (error) {
    console.error("Share error:", error);
    return { success: false, message: (error as Error).message };
  }
}

/**
 * Format achievement text for sharing
 */
export function formatAchievementText(
  type: "streak" | "badge" | "weekly" | "habit" | "cbt",
  data: Record<string, any>
): string {
  const appTag = "#Habeat #WellnessJourney";

  switch (type) {
    case "streak":
      return `${data.days}-day streak on Habeat! Consistency is key to building healthy habits. ${appTag}`;

    case "badge":
      return `Just earned the "${data.name}" badge on Habeat! ${data.description || ""} ${appTag}`;

    case "weekly":
      return `Weekly summary: ${data.daysTracked}/7 days tracked, ${data.consistencyScore}% consistency! ${appTag}`;

    case "habit":
      return `My habit score is ${data.score}! Building better habits one day at a time. ${appTag}`;

    case "cbt":
      return `Mindfulness milestone: ${data.moodsLogged} moods logged, ${data.exercisesCompleted} exercises completed! ${appTag}`;

    default:
      return `Check out my progress on Habeat! ${appTag}`;
  }
}
