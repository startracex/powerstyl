import tostring from "../tostring.js";
import sassmodule from "sass";
export const sass = (text: TemplateStringsArray, ...values: any[]) => {
  const string = tostring(text, ...values);
  const result = sassmodule.compileString(string).css;
  return result;
};
export default sass;