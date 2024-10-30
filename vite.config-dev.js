import { defineConfig } from "vite";
import del from "rollup-plugin-delete";

export default defineConfig({
  define: {
    DEV_MODE: true,
  },
  plugins: [
    del({ targets: "dist/*", ignore: ["dist/assets"], runOnce: true }),
    del({ targets: "dist/*", ignore: ["dist/assets", "dist/index*"], runOnce: true, hook: "buildEnd" }),
  ],
  server: {
    port  : 8080,
    watch : {
      usePolling: true,
    },
  },
  build: {
    outDir                : "dist",
    assetsDir             : "",
    minify                : false,
    emptyOutDir           : false,
    copyPublicDir         : false,
    chunkSizeWarningLimit : 2 * 1024, // 2MB
  },
  publicDir: "dist",
});
