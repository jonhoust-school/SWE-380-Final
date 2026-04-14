const { defineConfig } = require("vite");
const path = require("path");

module.exports = defineConfig({
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "src", "index.html")
    }
  }
});