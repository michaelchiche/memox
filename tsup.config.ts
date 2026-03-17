import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  bundle: true,
  platform: "node",
  target: "node18",
  external: ["better-sqlite3", "fs", "path", "os", "crypto"],
});