import React from "react";
import tostring from "./tostring.js";
/**
 * JSX:
 * ```jsx
 * const Red = inlined`color:red;`
 * <Red><span>text</span></Red>
 * ```
 * as
 * ```html
 * <span style="color:red;">text</span>
 * ```
 * error:
 * ```jsx
 * <Red><span>text</span><del>excess</del></Red>
 * ```
 */
export const inlined = (strings: TemplateStringsArray, ...values: any[]) => {
  const string = tostring(strings, ...values);
  return createStyledInlined(string);
};
/**
 * JSX:
 * ```js
 * const Red = tagged`h1``color:red;`
 * <Red>text</Red>
 * ```
 * as
 * ```html
 * <h1 style="color:red;">text</h1>
 * ```
 */
export const tagged = (strings: TemplateStringsArray, ...values: any[]) => {
  const tagname = tostring(strings, ...values);
  return (strings: TemplateStringsArray, ...values: any[]) => {
    const string = tostring(strings, ...values);
    return createStyledTagged(tagname, string);
  };
};
/**
 * styled = {@link tagged}\`div\` \
 * JSX:
 * ```jsx
 * const Red = styled`color:red;`
 * <Red>text</Red>
 * ```
 * as
 * ```html
 * <div style="color:red;">text</div>
 * ```
 */
export const styled = (strings: TemplateStringsArray, ...values: any[]) => {
  return tagged`div`(strings, ...values);
};
export default styled;
/**
 * <ReactElement style={stylobj`color:red;`}></ReactElement>
 * <ReactElement style={css`color:red;`}></ReactElement>
 */
export const stylobj = (strings: TemplateStringsArray, ...values: any[]) => {
  const string = tostring(strings, ...values);
  return getStyleObjectFromString(string);
};
export const css = stylobj;
function createStyledTagged(tagname: string, stylestring: string) {
  const style = getStyleObjectFromString(stylestring);
  return (props: any) => {
    const element = React.createElement(tagname, { style }, props.children);
    return element;
  };
};
function createStyledInlined(stylestring: string) {
  const style = getStyleObjectFromString(stylestring);
  return (props: any) => {
    const element = React.cloneElement(props.children, { style });
    return element;
  };
}
function getStyleObjectFromString(stylestring: string): StyleObject {
  const nocomments = stylestring.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');
  const stylessplit = nocomments.split(";");
  const style: StyleObject = {};
  for (let i = stylessplit.length - 1; i >= 0; i--) {
    const key = stylessplit[i].split(":")[0]?.trim();
    const val = stylessplit[i].split(":")[1]?.trim();
    if (key && val) {
      const keysplit = key.split("-");
      keysplit.map((v, i) => {
        if (i > 0) {
          keysplit[i] = v[0].toUpperCase() + v.slice(1);
        }
      });
      style[keysplit.join("")] = val;
    }
  }
  return Object.keys(style).length ? style : {
    "display": "contents"
  };
}
type StyleObject = { [key: string]: string; };