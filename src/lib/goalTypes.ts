import {
  Scale,
  Dumbbell,
  GlassWater,
  Leaf,
  Footprints,
  Apple,
  Flame,
  Moon,
  Target,
} from "lucide-react";

// Goal type templates for creating goals
export const GOAL_TYPES = [
  {
    id: "weight",
    name: "Weight",
    icon: Scale,
    color: "bg-orange-400",
    defaultUnit: "kg",
    defaultTarget: 70,
  },
  {
    id: "workout",
    name: "Workout",
    icon: Dumbbell,
    color: "bg-blue-400",
    defaultUnit: "workouts",
    defaultTarget: 20,
  },
  {
    id: "water",
    name: "Hydration",
    icon: GlassWater,
    color: "bg-cyan-400",
    defaultUnit: "glasses/day",
    defaultTarget: 8,
  },
  {
    id: "veggies",
    name: "Nutrition",
    icon: Leaf,
    color: "bg-green-400",
    defaultUnit: "portions/day",
    defaultTarget: 5,
  },
  {
    id: "run",
    name: "Cardio",
    icon: Footprints,
    color: "bg-pink-400",
    defaultUnit: "km",
    defaultTarget: 50,
  },
  {
    id: "calories",
    name: "Calories",
    icon: Flame,
    color: "bg-red-400",
    defaultUnit: "kcal/day",
    defaultTarget: 2000,
  },
  {
    id: "sleep",
    name: "Sleep",
    icon: Moon,
    color: "bg-indigo-400",
    defaultUnit: "hours/night",
    defaultTarget: 8,
  },
  {
    id: "protein",
    name: "Protein",
    icon: Apple,
    color: "bg-amber-400",
    defaultUnit: "g/day",
    defaultTarget: 120,
  },
] as const;

// Goal type configuration for displaying goals (icons, colors, gradients, backgrounds)
export const GOAL_TYPE_CONFIG: Record<
  string,
  { icon: any; color: string; gradient: string; lightBg: string }
> = {
  run: {
    icon: Footprints,
    color: "text-pink-500",
    gradient: "from-pink-500 to-rose-500",
    lightBg: "bg-pink-50",
  },
  weight: {
    icon: Scale,
    color: "text-orange-500",
    gradient: "from-orange-500 to-amber-500",
    lightBg: "bg-orange-50",
  },
  workout: {
    icon: Dumbbell,
    color: "text-blue-500",
    gradient: "from-blue-500 to-indigo-500",
    lightBg: "bg-blue-50",
  },
  water: {
    icon: GlassWater,
    color: "text-cyan-500",
    gradient: "from-cyan-500 to-teal-500",
    lightBg: "bg-cyan-50",
  },
  veggies: {
    icon: Leaf,
    color: "text-green-500",
    gradient: "from-green-500 to-emerald-500",
    lightBg: "bg-green-50",
  },
  calories: {
    icon: Flame,
    color: "text-red-500",
    gradient: "from-red-500 to-orange-500",
    lightBg: "bg-red-50",
  },
  sleep: {
    icon: Moon,
    color: "text-indigo-500",
    gradient: "from-indigo-500 to-purple-500",
    lightBg: "bg-indigo-50",
  },
  protein: {
    icon: Apple,
    color: "text-amber-500",
    gradient: "from-amber-500 to-yellow-500",
    lightBg: "bg-amber-50",
  },
};

// Helper function to get goal config with fallback
export const getGoalConfig = (iconType: string) => {
  return (
    GOAL_TYPE_CONFIG[iconType] || {
      icon: Target,
      color: "text-gray-500",
      gradient: "from-gray-500 to-gray-600",
      lightBg: "bg-gray-50",
    }
  );
};
