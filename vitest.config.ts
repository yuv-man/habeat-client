import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "mock-assets",
      enforce: "pre" as const,
      resolveId(id: string) {
        if (/\.(svg|png|jpg|jpeg|gif|webp|css)(\?.*)?$/.test(id)) {
          return `\0mock-asset:${id}`;
        }
      },
      load(id: string) {
        if (id.startsWith("\0mock-asset:")) {
          return "export default ''";
        }
      },
    },
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
