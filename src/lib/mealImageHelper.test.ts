import { describe, expect, it } from "vitest";
import { resolveMealImageName } from "./mealImageHelper";

/**
 * These assert the *shape* of the dish, not one exact filename — the art
 * folder changes, and pinning filenames would make this test a chore rather
 * than a guard. What must never regress is a taco being served a bowl of
 * pasta.
 */
const shapeOf = (name: string) => resolveMealImageName(name) ?? "";

describe("meal image matching", () => {
  it("keeps the dish's form, even when modifiers point elsewhere", () => {
    // Every one of these was previously matched on incidental adjectives.
    expect(shapeOf("Mustard Dill Tuna Tacos")).toContain("taco");
    expect(shapeOf("Chilli Lime Egg Soup")).toContain("soup");
    expect(shapeOf("Black Bean Oat Porridge")).toMatch(/porridge|oat/);
    expect(shapeOf("Turkey Tomato Garlic Salad")).toContain("salad");
    expect(shapeOf("Spiced Beef Pasta Salad")).toContain("salad");
  });

  it("never serves pasta to a dish that is not pasta", () => {
    for (const name of [
      "Mustard Dill Tuna Tacos",
      "Chilli Lime Egg Soup",
      "Thyme Butter Chicken Bake",
      "Turkey Tomato Garlic Salad",
      "Chia Seed Omelette",
    ]) {
      expect(shapeOf(name)).not.toMatch(/pasta|spaghetti|lasagna|gnocchi/);
    }
  });

  it("prefers the right protein within a form", () => {
    expect(shapeOf("Fish Tacos")).toBe("fish-tacos");
    expect(shapeOf("Chicken Caesar Salad")).toContain("chicken");
    expect(shapeOf("Turkey Club Sandwich")).toContain("turkey");
  });

  it("never puts the wrong animal on the plate", () => {
    expect(shapeOf("Beef Tacos")).not.toMatch(/fish|turkey|chicken|salmon/);
    expect(shapeOf("Thyme Butter Chicken Casserole")).not.toMatch(/beef|salmon|pork/);
    expect(shapeOf("Salmon Coconut Curry Skillet")).not.toMatch(/beef|chicken|turkey/);
  });

  it("gives different dishes different pictures", () => {
    const names = [
      "Mustard Dill Tuna Tacos",
      "Turkey Tomato Garlic Salad",
      "Chilli Lime Egg Soup",
      "Thyme Butter Chicken Bake",
      "Black Bean Oat Porridge",
    ];
    const picked = names.map(shapeOf);
    expect(new Set(picked).size).toBe(names.length);
  });

  it("is stable — the same meal always gets the same picture", () => {
    expect(shapeOf("Spiced Beef Quinoa Bowl")).toBe(shapeOf("Spiced Beef Quinoa Bowl"));
  });

  it("falls back when there is nothing to go on", () => {
    expect(resolveMealImageName("")).toBeNull();
    expect(resolveMealImageName("אורז")).toBeNull();
  });
});
