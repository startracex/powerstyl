import toString, { TemplateStringFunc } from "../tostring.js";
import * as sassModule from "sass";

function sass(strings: TemplateStringsArray, ...values: any[]): string;
function sass(object: sassModule.Options<"sync">): TemplateStringFunc<string>;

function sass(stringsOrObject: TemplateStringsArray | sassModule.Options<"sync">, ...values: any[]): string | TemplateStringFunc<string> {
  if (Array.isArray(stringsOrObject)) {
    const string = toString(stringsOrObject as TemplateStringsArray, values);
    return sasso(string, {});
  }
  return (strings: TemplateStringsArray, ...values: any[]) => {
    const string = toString(strings, values);
    return sasso(string, stringsOrObject as sassModule.Options<"sync">);
  };
}

export function sasso(input: string, options: sassModule.Options<"sync">): string {
  return sassModule.compileString(input, options).css;
}

export default sass;