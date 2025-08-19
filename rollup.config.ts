import type { RollupOptions } from "rollup";
import oxc from "rollup-plugin-oxc";
import { globSync } from "node:fs";

export default {
  input: Object.fromEntries(globSync("src/**/*.ts").map((path) => [path.slice(4, -3), path])),
  external: ["stylis"],
  plugins: [oxc({ minify: true })],
  output: [
    {
      dir: "dist",
      sourcemap: true,
      format: "esm",
    },
    {
      dir: "dist",
      sourcemap: true,
      format: "cjs",
      entryFileNames: "[name].cjs",
    },
  ],
} as RollupOptions;
