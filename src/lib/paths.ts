import ketoIcon from "@/assets/keto.svg";
import fastingIcon from "@/assets/fasting.png";
import healthyIcon from "@/assets/salad.svg";
import loseWeightIcon from "@/assets/looseWeight.svg";
import gainMuscleIcon from "@/assets/muscle.svg";
import otherIcon from "@/assets/food.svg";
import breakfastIcon from "@/assets/breakfast.svg";
import lunchIcon from "@/assets/noodles.svg";
import dinnerIcon from "@/assets/salad-try.svg";
import snackIcon from "@/assets/snack.svg";
import { Heart, Target, Star, Users } from "lucide-react";


export const paths = [
    { id: "healthy", label: "Be Healthy", description: "General wellness", emoji: "🌱", gradient: "bg-gradient-healthy", icon: healthyIcon, path: "healthy", color: "bg-gradient-healthy" },
    { id: "lose-weight", label: "Lose Weight", description: "Weight management", emoji: "🔴", gradient: "bg-gradient-lose", icon: loseWeightIcon, path: "lose-weight", color: "bg-gradient-lose" },
    { id: "gain-muscle", label: "Gain Muscle", description: "Athletic performance", emoji: "🟡", gradient: "bg-gradient-muscle", icon: gainMuscleIcon, path: "gain-muscle", color: "bg-gradient-muscle" },
    { id: "keto", label: "Keto", description: "Low carb lifestyle", emoji: "🟣", gradient: "bg-gradient-keto", icon: ketoIcon, path: "keto", color: "bg-gradient-keto" },
    { id: "fasting", label: "Intermittent Fasting", description: "Time-restricted eating", emoji: "🔵", gradient: "bg-gradient-fasting", icon: fastingIcon, path: "fasting", color: "bg-gradient-fasting" },
    { id: "other", label: "Other", description: "Custom or skip", emoji: "🟠", gradient: "bg-gradient-other", icon: otherIcon, path: "other", color: "bg-gradient-other" },
  ];

  export const features = [
    {
      icon: Target,
      title: "Personalized Goals",
      description: "Set and track custom health goals based on your lifestyle and preferences"
    },
    {
      icon: Heart,
      title: "Health Monitoring",
      description: "Track calories, nutrients, water intake, and workout progress in real-time"
    },
    {
      icon: Star,
      title: "Smart Recommendations",
      description: "AI-powered meal suggestions and nutrition advice tailored to your goals"
    },
    {
      icon: Users,
      title: "Social Sharing",
      description: "Share progress with friends and stay motivated together"
    }
  ];

  export const caloriesPercentage = {
    breakfast: {
      min: 0.2,
      max: 0.3
    },
    lunch: {
      min: 0.3,
      max: 0.35
    },
    dinner: {
      min: 0.3,
      max: 0.35
    },
    snacks: {
      min: 0.1,
      max: 0.15
    }
  }

  export const mealTypes = {
    breakfast: {
      id: "breakfast",
      label: "Breakfast",
      icon: breakfastIcon
    },

    lunch: {
      id: "lunch",
      label: "Lunch",
      icon: lunchIcon
    },
    
    dinner: {
      id: "dinner",
      label: "Dinner",
      icon: dinnerIcon
    },
    
    snacks: {
      id: "snacks",
      label: "Snacks",
      icon: snackIcon
    }
  }


  