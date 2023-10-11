import tostring from "../tostring.js";
import lessmodule from "less";
export const less = async (
  text: TemplateStringsArray,
  ...values: any[]
): Promise<string> => {
  return await lesso({})(text, ...values);
};
export const lesso = (option: Less.Options) => {
  return async (text: TemplateStringsArray, ...values: any[]) => {
    const string = tostring(text, ...values);
    const result = (await lessmodule.render(string, option)).css;
    return result;
  };
};
export default less;
