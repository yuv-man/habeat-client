const config = {
  // 5 minutes timeout for meal plan generation (AI can take a while)
  mealGenerationTimeout: 300000,
  useMock: false,
  // Use production URL in production mode, development URL otherwise
  baseURL:
    import.meta.env.VITE_MODE === "production"
      ? import.meta.env.VITE_BASE_URL_PROD
      : import.meta.env.VITE_BASE_URL_DEV || "http://localhost:5000/api",
  // Test mode - bypasses authentication for frontend testing
  testFrontend: import.meta.env.VITE_TEST_FRONTEND === "true",
};

// Log the API URL on startup (for debugging)
console.log("[config] API baseURL:", config.baseURL);
console.log("[config] Environment:", {
  VITE_MODE: import.meta.env.VITE_MODE,
  VITE_BASE_URL_DEV: import.meta.env.VITE_BASE_URL_DEV,
  VITE_BASE_URL_PROD: import.meta.env.VITE_BASE_URL_PROD,
});

export default config;
