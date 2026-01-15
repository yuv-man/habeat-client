import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { IngredientInput } from "@/lib/shoppingHelpers";
import { getCategoryIcon } from "@/lib/shoppingCategoryIcons";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: IngredientInput) => void;
  categories: string[];
}

const AddItemModal = ({
  isOpen,
  onClose,
  onAdd,
  categories,
}: AddItemModalProps) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    amount: "",
    category: "",
  });

  const handleClose = () => {
    setNewItem({ name: "", amount: "", category: "" });
    setShowCategoryDropdown(false);
    onClose();
  };

  const handleAdd = () => {
    if (!newItem.name.trim() || !newItem.amount.trim() || !newItem.category) {
      return;
    }

    const ingredient: IngredientInput = {
      name: newItem.name.trim(),
      amount: newItem.amount.trim(),
      category: newItem.category,
      done: false,
    };

    onAdd(ingredient);
    setNewItem({ name: "", amount: "", category: "" });
    setShowCategoryDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Add Item</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          {/* Name Input */}
          <div>
            <label
              htmlFor="item-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Item Name
            </label>
            <input
              id="item-name"
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="e.g., Chicken Breast"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Amount Input */}
          <div>
            <label
              htmlFor="item-amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount with Unit
            </label>
            <input
              id="item-amount"
              type="text"
              value={newItem.amount}
              onChange={(e) =>
                setNewItem({ ...newItem, amount: e.target.value })
              }
              placeholder="e.g., 500 g, 2 pcs, 1 cup"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label
              htmlFor="item-category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-left flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {newItem.category ? (
                    <>
                      {(() => {
                        const { icon: CategoryIcon, color } = getCategoryIcon(newItem.category);
                        return <CategoryIcon className={`w-4 h-4 ${color}`} />;
                      })()}
                      <span className="text-gray-900">{newItem.category}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">Select a category</span>
                  )}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showCategoryDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                  {categories.map((category) => {
                    const { icon: CategoryIcon, color } = getCategoryIcon(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setNewItem({ ...newItem, category });
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition flex items-center gap-2 ${
                          newItem.category === category
                            ? "bg-green-50 text-green-600"
                            : "text-gray-700"
                        } ${
                          category === "Other" ? "border-t border-gray-100" : ""
                        }`}
                      >
                        <CategoryIcon className={`w-4 h-4 ${color}`} />
                        {category}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-100">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={
              !newItem.name.trim() ||
              !newItem.amount.trim() ||
              !newItem.category
            }
            className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
