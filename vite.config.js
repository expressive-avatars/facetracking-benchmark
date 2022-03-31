import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

const rootDir = resolve(__dirname, "src/pages")

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: rootDir,
  publicDir: resolve(__dirname, "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    rollupOptions: {
      input: {
        index: resolve(rootDir, "index.html"),
        desktop: resolve(rootDir, "desktop/index.html"),
        ios: resolve(rootDir, "ios/index.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    hmr: {
      clientPort: 443,
    },
  },
})
