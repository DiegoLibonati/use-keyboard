import path from "path";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LIB_NAME = "use-keyboard-react";

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
      outDir: "dist/types",
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tests": path.resolve(__dirname, "./__tests__"),
    },
  },
  publicDir: false,
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: LIB_NAME,
      fileName: (format) => `${LIB_NAME}.${format}.js`,
      formats: ["es", "umd"],
    },
    outDir: "dist",
    sourcemap: true,
    minify: "esbuild",
    target: "ES2022",
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
