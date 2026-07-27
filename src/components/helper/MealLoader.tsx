import React, { useState, useEffect } from "react";
import logo from "@/assets/logos/habeat-logo.png";

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
      {/* Spinner rings + logo */}
      <div style={{ position: "relative", width: 120, height: 120 }}>

        {/* Outer ring — slow clockwise, dashed like artichoke leaves */}
        <svg
          viewBox="0 0 120 120"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            animation: "habeatSpin 3.6s linear infinite",
          }}
        >
          <circle
            cx="60" cy="60" r="56"
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeDasharray="16 9"
            strokeLinecap="round"
            opacity="0.35"
          />
        </svg>

        {/* Middle ring — faster, counter-clockwise */}
        <svg
          viewBox="0 0 120 120"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            animation: "habeatSpin 2.4s linear infinite reverse",
          }}
        >
          <circle
            cx="60" cy="60" r="43"
            fill="none"
            stroke="#059669"
            strokeWidth="3"
            strokeDasharray="11 7"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>

        {/* Inner ring — slow, clockwise, tighter dashes */}
        <svg
          viewBox="0 0 120 120"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            animation: "habeatSpin 5s linear infinite",
          }}
        >
          <circle
            cx="60" cy="60" r="30"
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
            strokeDasharray="7 5"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>

        {/* Artichoke logo — gentle pulse */}
        <img
          src={logo}
          alt="Habeat"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: "22px",
            animation: "habeatLogoPulse 2s ease-in-out infinite",
          }}
        />
      </div>

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
        @keyframes habeatSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes habeatLogoPulse {
          0%, 100% { transform: scale(0.92); opacity: 0.85; }
          50%       { transform: scale(1.04); opacity: 1; }
        }
        @keyframes habeatFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MealLoader;
