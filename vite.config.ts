import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import svgr from "vite-plugin-svgr";
import { isPersonalKey } from "./src/lib/posthogKey";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // A personal PostHog key (phx_) is a login to the PostHog account. Vite
  // inlines every VITE_ variable into the bundle, so it must never be one.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const personalKey = isPersonalKey(env.VITE_POSTHOG_KEY);
  if (personalKey) {
    const message =
      "VITE_POSTHOG_KEY is a PostHog personal API key (phx_…). Use the project API key " +
      "(phc_…) from PostHog → Project settings, and revoke the personal key.";
    if (command === "build") throw new Error(message);
    console.warn(`\n⚠️  ${message}\n   Analytics is disabled and the key is kept out of the dev bundle.\n`);
  }

  return {
    // Replaces the key everywhere it is read, so it is not inlined into any bundle.
    define: personalKey ? { "import.meta.env.VITE_POSTHOG_KEY": JSON.stringify("") } : {},
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: "http://localhost:5080",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: "dist",
    },
    plugins: [react(), svgr()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
