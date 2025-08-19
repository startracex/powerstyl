import { compile, middleware, serialize, stringify } from "stylis";
import transformer from "./lib/transformer.ts";
import host from "./lib/host-middleware.ts";

const middlewares = [];
transformer.transform = (css: string) => {
  return serialize(compile(css), middleware([...middlewares, host, stringify]));
};

export const use = (...middleware: any[]): void => {
  middlewares.push(...middleware);
};

export * from "./raw.ts";
