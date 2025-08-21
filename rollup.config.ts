import type { RollupOptions } from "rollup";
import oxc from "rollup-plugin-oxc";
import { globSync } from "node:fs";

export default {
  input: Object.fromEntries(globSync("src/**/*.ts").map((path) => [path.slice(4, -3), path])),
  external: ["unnestcss"],
  plugins: [oxc({ minify: true })],
  output: [
    {
      format: "esm",
    },
    {
      format: "cjs",
      entryFileNames: "[name].cjs",
      exports: "named",
    },
  ].map((o) => ({
    dir: "dist",
    sourcemap: true,
    hoistTransitiveImports: false,
    ...o,
  })),
} as RollupOptions;
