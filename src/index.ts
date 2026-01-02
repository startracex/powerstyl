import { Powerstyl } from "./lib/powerstyl.ts";
import { unnest } from "unnestcss";

export class NestablePowerstyl extends Powerstyl {
  transform(s: string): string {
    return unnest(s);
  }
}

const defaultInstance = new NestablePowerstyl();

export const styled: NestablePowerstyl["styled"] = defaultInstance.styled.bind(defaultInstance);
export const updateStyle: NestablePowerstyl["updateStyle"] = defaultInstance.updateStyle.bind(defaultInstance);

export * from "./lib/powerstyl.ts";
