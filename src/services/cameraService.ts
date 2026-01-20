import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { isNativePlatform } from "@/lib/platform";

export interface PhotoResult {
  base64: string;
  format: string;
}

/**
 * Take a photo using the device camera
 * Uses Capacitor Camera on native platforms, file input on web
 */
export const takePhoto = async (): Promise<PhotoResult> => {
  if (isNativePlatform()) {
    return takePhotoNative();
  } else {
    return takePhotoWeb();
  }
};

/**
 * Take photo using native Capacitor Camera
 */
const takePhotoNative = async (): Promise<PhotoResult> => {
  const photo = await Camera.getPhoto({
    quality: 80,
    allowEditing: false,
    resultType: CameraResultType.Base64,
    source: CameraSource.Camera, // Camera only, no gallery
    saveToGallery: false,
    correctOrientation: true,
  });

  if (!photo.base64String) {
    throw new Error("Failed to capture photo");
  }

  return {
    base64: photo.base64String,
    format: photo.format || "jpeg",
  };
};

/**
 * Take photo using web file input with camera capture
 */
const takePhotoWeb = (): Promise<PhotoResult> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // Prefer rear camera

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      try {
        const base64 = await fileToBase64(file);
        // Remove data URI prefix to get just the base64 data
        const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;

        resolve({
          base64: base64Data,
          format: file.type.split("/")[1] || "jpeg",
        });
      } catch (error) {
        reject(error);
      }
    };

    input.onerror = () => {
      reject(new Error("Failed to open camera"));
    };

    // Handle user cancellation
    input.oncancel = () => {
      reject(new Error("Photo capture cancelled"));
    };

    input.click();
  });
};

/**
 * Convert a file to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Check if camera is available
 */
export const isCameraAvailable = async (): Promise<boolean> => {
  if (isNativePlatform()) {
    try {
      const permission = await Camera.checkPermissions();
      return permission.camera !== "denied";
    } catch {
      return false;
    }
  }
  // On web, assume camera is available (will be checked when opening)
  return true;
};

/**
 * Request camera permissions (native only)
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  if (isNativePlatform()) {
    try {
      const permission = await Camera.requestPermissions();
      return permission.camera === "granted";
    } catch {
      return false;
    }
  }
  return true;
};
