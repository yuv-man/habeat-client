const config = {
    mealGenerationTimeout: 60000,
    useMock: false,
    // Use relative URL in development to leverage Vite proxy and avoid CORS issues
    baseURL: import.meta.env.DEV ? '/api' : 'http://localhost:5000/api',
}

export default config;