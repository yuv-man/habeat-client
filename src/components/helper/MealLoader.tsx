import React, { useState, useEffect } from "react";
import "@/styles/mealLoader.css";

interface MealLoaderProps {
  /** Array of strings to display sequentially */
  customMessages?: string[];
  /** Time in milliseconds between message changes */
  interval?: number;
  /** Size variant: "small" for inline/button use, "default" for full display */
  size?: "small" | "default";
}

const MealLoader: React.FC<MealLoaderProps> = ({
  customMessages = [
    "🥗 Gathering fresh ingredients...",
    "👨‍🍳 Consulting the digital chef...",
    "🍎 Balancing your nutrients...",
    "🍳 Seasoning the recipes...",
    "🍽️ Plating your weekly plan...",
  ],
  interval = 2500,
  size = "default",
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    // Typing the timer for browser environment
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % customMessages.length);
    }, interval);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, [customMessages.length, interval]);

  // Small inline version for buttons
  if (size === "small") {
    return (
      <div className="meal-loader-small" role="status" aria-live="polite">
        <div className="pot-small">
          <div className="steam-lines-small">
            <span className="steam-small"></span>
            <span className="steam-small"></span>
            <span className="steam-small"></span>
          </div>
          <div className="pot-body-small"></div>
        </div>
        <span className="ml-2">Generating...</span>
      </div>
    );
  }

  return (
    <div className="meal-loader-container" role="status" aria-live="polite">
      <div className="culinary-icon">
        <div className="pot">
          <div className="steam-lines">
            <span className="steam"></span>
            <span className="steam"></span>
            <span className="steam"></span>
          </div>
          <div className="pot-body"></div>
        </div>
      </div>

      <h3 className="status-title">{customMessages[currentIndex]}</h3>
      <p className="sub-text">Our AI is crafting your perfect menu...</p>
    </div>
  );
};

export default MealLoader;
