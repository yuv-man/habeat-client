const config = {
  mealGenerationTimeout: 60000,
  useMock: false,
  // Use relative URL in development to leverage Vite proxy and avoid CORS issues
  baseURL: import.meta.env.BASE_URL_DEV ? "/api" : "http://localhost:5000/api",
  // Test mode - bypasses authentication for frontend testing
  testFrontend: import.meta.env.VITE_TEST_FRONTEND === "true",
};

export default config;
