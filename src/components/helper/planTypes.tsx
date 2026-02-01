import customImg from "@/assets/planTypes/costum-plan.webp";
import redCarpetImg from "@/assets/planTypes/red-carpet.webp";
import highPerformanceImg from "@/assets/planTypes/high-performance-fuel.webp";
import plantForwardImg from "@/assets/planTypes/plant-forward.webp";
import mindfulLivingImg from "@/assets/planTypes/mindful-living.webp";
import modernComfortImg from "@/assets/planTypes/modern-comfort.webp";

export interface PlanTemplate {
  id: string;
  name: string;
  image: string;
  bestFor: string;
  description: string;
  includes: string[];
}
export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "custom",
    name: "Custom Plan",
    image: customImg,
    bestFor: "Personalized to your goals",
    description:
      "AI generates a fully personalized plan based on your goals, preferences, and dietary needs.",
    includes: [
      "Goal-driven meal planning",
      "Macro targets from your profile",
      "Adapted to your fitness goals",
    ],
  },
  {
    id: "red-carpet-balance",
    name: "Red Carpet Balance",
    image: redCarpetImg,
    bestFor: "Everyday wellness, busy schedules",
    description:
      "A flexible, feel-good plan built around whole foods, regular meals, and enjoyment.",
    includes: [
      "Balanced carbs, protein, and fats",
      "Simple breakfasts & satisfying dinners",
      "Built-in flexibility (80/20 style)",
    ],
  },
  {
    id: "high-performance-fuel",
    name: "High-Performance Fuel",
    image: highPerformanceImg,
    bestFor: "Active users, workouts, energy focus",
    description:
      "A performance-driven plan emphasizing protein, complex carbs, and nutrient timing.",
    includes: [
      "Higher protein meals",
      "Energy-focused snacks",
      "Recovery-friendly dinners",
    ],
  },
  {
    id: "plant-forward-glow",
    name: "Plant-Forward Glow",
    image: plantForwardImg,
    bestFor: "Plant-based or light eaters",
    description:
      "A colorful, plant-first plan centered on vegetables, fruits, grains, and plant proteins.",
    includes: [
      "Fiber-rich meals",
      "Anti-inflammatory foods",
      "Light but filling recipes",
    ],
  },
  {
    id: "mindful-living",
    name: "Mindful Living",
    image: mindfulLivingImg,
    bestFor: "Stress, digestion, routine building",
    description:
      "A gentle, nourishing plan focused on regular meals, simple ingredients, and mindful eating.",
    includes: [
      "Comfort-focused meals",
      "Easy-to-digest foods",
      "Routine-friendly portions",
    ],
  },
  {
    id: "modern-comfort",
    name: "Modern Comfort",
    image: modernComfortImg,
    bestFor: "Beginners, emotional eaters",
    description:
      "Familiar, comforting meals made healthier. Perfect for rebuilding a positive relationship with food.",
    includes: ["Familiar flavors", "Healthier swaps", 'Zero "forbidden foods"'],
  },
];
