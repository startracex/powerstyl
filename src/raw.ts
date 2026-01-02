import { Powerstyl } from "./lib/powerstyl.ts";

const defaultInstance = new Powerstyl();

export const styled: Powerstyl["styled"] = defaultInstance.styled.bind(defaultInstance);
export const updateStyle: Powerstyl["updateStyle"] = defaultInstance.updateStyle.bind(defaultInstance);

export * from "./lib/powerstyl.ts";
