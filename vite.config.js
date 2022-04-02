import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import fs from "fs"

const rootDir = path.resolve(__dirname, "src/pages")

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mediapipe_workaround()],
  root: rootDir,
  publicDir: path.resolve(__dirname, "public"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    target: "esnext",
    rollupOptions: {
      input: {
        index: path.resolve(rootDir, "index.html"),
        dashboard: path.resolve(rootDir, "dashboard/index.html"),
        hallway: path.resolve(rootDir, "hallway/index.html"),
        ios: path.resolve(rootDir, "ios/index.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  define: {
    AVATAR_WEBKIT_AUTH_TOKEN: `"${process.env.AVATAR_WEBKIT_AUTH_TOKEN}"`,
  },
  server: {
    hmr: {
      clientPort: 443,
    },
  },
})

// https://github.com/google/mediapipe/issues/2883
function mediapipe_workaround() {
  return {
    name: "mediapipe_workaround",
    load(id) {
      if (path.basename(id) === "face_mesh.js") {
        console.log("injecting FaceMesh export")
        let code = fs.readFileSync(id, "utf-8")
        code += "exports.FaceMesh = FaceMesh;"
        return { code }
      } else {
        return null
      }
    },
  }
}
