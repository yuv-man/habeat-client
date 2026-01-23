import { useState } from "react";
import { X, Clock, Camera } from "lucide-react";
import MealLoader from "@/components/helper/MealLoader";
import { takePhoto } from "@/services/cameraService";

interface AddSnackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (snackName: string, time?: string, photoBase64?: string) => void;
  date: string;
  loading?: boolean;
}

const AddSnackModal = ({
  isOpen,
  onClose,
  onAdd,
  date,
  loading = false,
}: AddSnackModalProps) => {
  const [snackName, setSnackName] = useState("");
  const [snackTime, setSnackTime] = useState("");
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);

  const handleClose = () => {
    if (loading) return;
    setSnackName("");
    setSnackTime("");
    setPhotoBase64("");
    setPhotoPreview("");
    onClose();
  };

  const handleAdd = () => {
    if (!snackName.trim() || loading) return;
    onAdd(snackName.trim(), snackTime || undefined, photoBase64 || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && snackName.trim() && !loading) {
      handleAdd();
    }
  };

  const handleTakePhoto = async () => {
    setIsCapturingPhoto(true);
    try {
      const photo = await takePhoto();
      setPhotoBase64(photo.base64);
      // Create preview URL from base64
      setPhotoPreview(`data:image/${photo.format};base64,${photo.base64}`);
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("cancel")) {
        // User cancelled, do nothing
      } else {
        console.error("Photo capture error:", err);
        alert(err.message || "Failed to capture photo. Please try again.");
      }
    } finally {
      setIsCapturingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoBase64("");
    setPhotoPreview("");
  };

  if (!isOpen) return null;

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-900">Add Snack</h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          <div>
            <label
              htmlFor="snack-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Snack Name
            </label>
            <input
              id="snack-name"
              type="text"
              value={snackName}
              onChange={(e) => setSnackName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Apple with Peanut Butter"
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="snack-time"
              className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"
            >
              <Clock className="w-4 h-4 text-gray-500" />
              Time (Optional)
            </label>
            <input
              id="snack-time"
              type="time"
              value={snackTime}
              onChange={(e) => setSnackTime(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Photo Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo (Optional)
            </label>
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Snack preview"
                  className="w-full h-48 object-cover rounded-xl border border-gray-200"
                />
                <button
                  onClick={handleRemovePhoto}
                  disabled={loading}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition disabled:opacity-50"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleTakePhoto}
                disabled={loading || isCapturingPhoto}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCapturingPhoto ? (
                  <>
                    <MealLoader size="small" />
                    <span className="text-sm text-gray-600">Capturing...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Take Photo
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {formattedDate && (
            <div className="text-sm text-gray-500">
              Adding snack for{" "}
              <span className="font-medium text-gray-700">{formattedDate}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!snackName.trim() || loading}
            className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <MealLoader size="small" />
                Adding...
              </>
            ) : (
              "Add Snack"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSnackModal;
