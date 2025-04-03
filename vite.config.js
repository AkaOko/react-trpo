import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "https://react-trpo-last-okm9vxtr7-akaokos-projects.vercel.app",
        changeOrigin: true,
      },
    },
  },
});
