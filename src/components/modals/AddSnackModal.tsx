import { useState } from "react";
import { X } from "lucide-react";
import MealLoader from "@/components/helper/MealLoader";

interface AddSnackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (snackName: string) => void;
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

  const handleClose = () => {
    if (loading) return;
    setSnackName("");
    onClose();
  };

  const handleAdd = () => {
    if (!snackName.trim() || loading) return;
    onAdd(snackName.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && snackName.trim() && !loading) {
      handleAdd();
    }
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
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
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

          {formattedDate && (
            <div className="text-sm text-gray-500">
              Adding snack for{" "}
              <span className="font-medium text-gray-700">{formattedDate}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-100">
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
