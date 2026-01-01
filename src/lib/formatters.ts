/**
 * Format meal name: replace underscores with spaces and capitalize each word
 * e.g., "Minced_beef_and_rice_stuffed_bell_peppers" -> "Minced Beef And Rice Stuffed Bell Peppers"
 */
export const formatMealName = (name: string): string => {
  if (!name) return "";
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Format ingredient name: replace underscores with spaces
 */
export const formatIngredientName = (name: string): string => {
  if (!name) return "";
  return name.replace(/_/g, " ");
};

