import React from "react";
import HealthyBalance from "@/assets/dietTypes/healthy_diet.svg?react";
import MuscleUp from "@/assets/dietTypes/gain_muscle_diet.svg?react";
import Keto from "@/assets/dietTypes/keto_diet.svg?react";
import Running from "@/assets/dietTypes/run_diet.svg?react";
import LoseWeight from "@/assets/dietTypes/lose_weight_diet.svg?react";
import FastingIcon from "@/assets/dietTypes/fest-diet.svg?react";

export interface AuthData {
  name: string;
  email: string;
  password: string;
  authMethod: string | null;
}

export interface KYCData {
  dietType: string;
  weight: string;
  height: string;
  age: string;
  gender: string;
  workoutFrequency: number;
  allergies: string[];
  dislikes: string[];
  favoriteFoods: string[];
  fastingHours?: number; // For 8-16 fasting diet type
  fastingStartTime?: string; // Time when fasting starts (e.g., "20:00")
}

export interface CustomInputs {
  allergy: string;
  dislike: string;
  favoriteFood: string;
}

export interface DietType {
  name: string;
  icon: React.ReactNode;
  color: string;
  iconColor: string;
}

export const allergies = [
  "Dairy",
  "Gluten",
  "Nuts",
  "Shellfish",
  "Soy",
  "Eggs",
  "Peanuts",
  "Sesame",
  "Fish",
  "Wheat",
  "Corn",
  "Mustard",
  "Celery",
  "Lupin",
  "Sulfites",
];

export const dislikes = [
  "Olives",
  "Mushrooms",
  "Broccoli",
  "Cilantro",
  "Bell Peppers",
  "Onions",
  "Tomatoes",
  "Spicy Food",
  "Tofu",
  "Eggplant",
  "Spinach",
  "Avocado",
  "Artichoke",
];

export const favoriteFoods = [
  "Pizza",
  "Pasta",
  "Sushi",
  "Tacos",
  "Burgers",
  "Salad",
  "Steak",
  "Chicken Curry",
  "Ramen",
  "Smoothies",
  "Oatmeal",
  "Sandwiches",
  "Stir-fry",
  "Soup",
  "Curry",
  "Pho",
  "Dumplings",
];

export const dietTypes: DietType[] = [
  {
    name: "Keto",
    icon: (
      <div className="scale-[0.2]">
        <Keto />
      </div>
    ),
    color: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    name: "Healthy Balance",
    icon: (
      <div className="scale-[0.2]">
        <HealthyBalance />
      </div>
    ),
    color: "bg-teal-100",
    iconColor: "text-teal-500",
  },
  {
    name: "Muscle Up",
    icon: (
      <div className="scale-[0.2]">
        <MuscleUp />
      </div>
    ),
    color: "bg-purple-100",
    iconColor: "text-purple-500",
  },
  {
    name: "Running",
    icon: (
      <div className="scale-[0.2]">
        <Running />
      </div>
    ),
    color: "bg-blue-100",
    iconColor: "text-blue-500",
  },
  {
    name: "Lose Weight",
    icon: (
      <div className="scale-[0.2]">
        <LoseWeight />
      </div>
    ),
    color: "bg-red-100",
    iconColor: "text-red-500",
  },
  {
    name: "8 - 16 hours fasting",
    icon: (
      <div className="scale-[0.15]">
        <FastingIcon />
      </div>
    ),
    color: "bg-green-100",
    iconColor: "text-green-500",
  },
];
