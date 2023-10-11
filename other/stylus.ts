import tostring from "../tostring.js";
import stylusmodule from "stylus";
export const stylus = (
  text: TemplateStringsArray,
  ...values: any[]
): string => {
  return styluso({})(text, ...values);
};
export const styluso = (option: stylusmodule.RenderOptions) => {
  return (text: TemplateStringsArray, ...values: any[]) => {
    const string = tostring(text, ...values);
    const result = stylusmodule.render(string, option);
    return result;
  };
};
export default stylus;
