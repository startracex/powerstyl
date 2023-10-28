import toString, { TemplateStringFunc } from "../tostring.js";
import lessModule from "less";

function less(strings: TemplateStringsArray, ...values: any[]): string;
function less(object: Less.Options,): TemplateStringFunc<string>;

function less(stringsOrObject: TemplateStringsArray | Less.Options, ...values: any[]): string | TemplateStringFunc<string> {
  if (Array.isArray(stringsOrObject)) {
    const string = toString(stringsOrObject as TemplateStringsArray, values);
    return lesso(string, {});
  }
  return (strings: TemplateStringsArray, ...values: any[]) => {
    const string = toString(strings, values);
    return lesso(string, stringsOrObject as Less.Options);
  };
}

export function lesso(input: string, options: Less.Options): string {
  let result = "";
  lessModule.render(input, options, function (_, output) {
    result = output?.css || "";
  });
  return result;
}

export default less;
