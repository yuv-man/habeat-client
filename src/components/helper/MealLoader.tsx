import React, { useState, useEffect } from "react";
import FoodAnimation from "@/components/helper/FoodAnimation";

interface MealLoaderProps {
  customMessages?: string[];
  interval?: number;
  size?: "small" | "default";
}

const MealLoader: React.FC<MealLoaderProps> = ({
  customMessages = [
    "Gathering fresh ingredients...",
    "Consulting the digital chef...",
    "Balancing your nutrients...",
    "Seasoning the recipes...",
    "Plating your weekly plan...",
  ],
  interval = 2500,
  size = "default",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % customMessages.length);
    }, interval);
    return () => clearInterval(timer);
  }, [customMessages.length, interval]);

  if (size === "small") {
    return (
      <span
        role="status"
        aria-label="Loading"
        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "currentColor",
              animation: `habeatLeafBounce 1s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes habeatLeafBounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40%            { transform: scale(1.2); opacity: 1; }
          }
        `}</style>
      </span>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1rem",
        gap: "1.5rem",
        textAlign: "center",
      }}
    >
      <FoodAnimation size={140} />

      {/* Cycling message */}
      <div>
        <p
          key={currentIndex}
          style={{
            fontSize: "1.05rem",
            fontWeight: 600,
            color: "#1f2937",
            margin: 0,
            animation: "habeatFadeIn 0.4s ease",
          }}
        >
          {customMessages[currentIndex]}
        </p>
        <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.35rem" }}>
          Our AI is crafting your perfect menu...
        </p>
      </div>

      <style>{`
        @keyframes habeatFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MealLoader;
