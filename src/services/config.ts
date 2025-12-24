const config = {
  // 5 minutes timeout for meal plan generation (AI can take a while)
  mealGenerationTimeout: 300000,
  useMock: false,
  // Use production URL in production mode, development URL otherwise
  baseURL:
    import.meta.env.MODE === "production"
      ? import.meta.env.VITE_BASE_URL_PROD
      : import.meta.env.VITE_BASE_URL_DEV || "http://localhost:5000/api",
  // Test mode - bypasses authentication for frontend testing
  testFrontend: import.meta.env.VITE_TEST_FRONTEND === "true",
};

export default config;
