import { Heart, Target, Star, Users } from "lucide-react";

export enum TMealCategory {
  breakfast = "breakfast",
  lunch = "lunch",
  dinner = "dinner",
  snacks = "snacks",
}

export const features = [
  {
    icon: Target,
    title: "Personalized Goals",
    description:
      "Set and track custom health goals based on your lifestyle and preferences",
  },
  {
    icon: Heart,
    title: "Health Monitoring",
    description:
      "Track calories, nutrients, water intake, and workout progress in real-time",
  },
  {
    icon: Star,
    title: "Smart Recommendations",
    description:
      "AI-powered meal suggestions and nutrition advice tailored to your goals",
  },
  {
    icon: Users,
    title: "Social Sharing",
    description: "Share progress with friends and stay motivated together",
  },
];

export const dietTypes = [
  "keto",
  "healthy",
  "gain-muscle",
  "lose-weight",
  "fasting",
  "other",
] as const;

export const caloriesPercentage = {
  breakfast: {
    min: 0.2,
    max: 0.3,
  },
  lunch: {
    min: 0.3,
    max: 0.35,
  },
  dinner: {
    min: 0.3,
    max: 0.35,
  },
  snacks: {
    min: 0.1,
    max: 0.15,
  },
};
