import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@/test/test-utils";
import DishPicture from "./DishPicture";

vi.mock("@/lib/mealImageHelper", () => ({
  findMealImage: (name: string) => (name === "Spaghetti bolognese" ? "/assets/spaghetti.jpg" : undefined),
}));

describe("DishPicture", () => {
  it("falls back to the app's meal photo when the dish's own image is missing", () => {
    // The own dish images are listed on the server but not shipped; every
    // My Meals card used to show a broken image.
    const { container } = render(
      <DishPicture name="Spaghetti bolognese" imageUrl="/images/dishes/spaghetti-bolognese.webp" icon="🍝" />,
    );
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "/images/dishes/spaghetti-bolognese.webp");
    fireEvent.error(img);
    expect(container.querySelector("img")).toHaveAttribute("src", "/assets/spaghetti.jpg");
  });

  it("shows the icon when no picture loads", () => {
    const { container, getByText } = render(
      <DishPicture name="Mum's soup" imageUrl="/images/dishes/mums-soup.webp" icon="🍲" />,
    );
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    expect(getByText("🍲")).toBeInTheDocument();
  });

  it("shows nothing without an icon, for the onboarding chips", () => {
    const { container } = render(<DishPicture name="Mum's soup" />);
    expect(container).toBeEmptyDOMElement();
  });
});
