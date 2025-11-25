export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  checked: boolean;
}

export interface ShoppingCategory {
  category: string;
  items: ShoppingItem[];
  color: "orange" | "yellow";
}

// Mock ingredients as they would come from weekly plan: [{name, amount}]
export const mockShoppingIngredients = [
  { name: "Fresh Spinach", amount: "200 g" },
  { name: "Bell Peppers (red & yellow)", amount: "2 pcs" },
  { name: "Sweet Potatoes", amount: "1 large" },
  { name: "Chicken Breast", amount: "500 g" },
  { name: "Salmon Fillets", amount: "300 g" },
  { name: "Eggs", amount: "12 pcs" },
  { name: "Brown Rice", amount: "500 g" },
  { name: "Quinoa", amount: "250 g" },
  { name: "Whole Wheat Bread", amount: "1 loaf" },
  { name: "Avocado", amount: "2 pcs" },
  { name: "Olive Oil", amount: "500 ml" },
  { name: "Greek Yogurt", amount: "1 large tub" },
  { name: "Almond Milk", amount: "500 ml" },
];
