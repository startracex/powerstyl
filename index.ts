import toString, { TemplateStringFunction } from "./tostring.js";
import { createInlined, createTagged, toCSSProperties, type StylerComponent } from "./utils.js";

let defaultTagName = "div";
export function SetDefaultTagName(a: string) {
  defaultTagName = a;
}

/**
 * JSX:
 * ```jsx
 * const Red = inlined`color:red;`
 * <Red><h1>text</h1></Red>
 * ```
 * as
 * ```html
 * <h1 style="color:red;">text</h1>
 * ```
 * error:
 * ```jsx
 * <Red><h1>text</h1><del>excess</del></Red>
 * ```
 */
export const inlined: TemplateStringFunction<StylerComponent> = (strings: TemplateStringsArray, ...values: any[]) => {
  const string = toString(strings, ...values);
  return createInlined(string);
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
export const tagged: TemplateStringFunction<TemplateStringFunction<StylerComponent>> = (strings: TemplateStringsArray, ...values: any[]) => {
  const tagName = toString(strings, ...values);
  return (strings: TemplateStringsArray, ...values: any[]) => {
    const string = toString(strings, ...values);
    return createTagged(tagName, string);
  };
};

/**
 * styled = {@link tagged}\`h1\` \
 * JSX:
 * ```jsx
 * const Red = styled`color:red;`
 * <Red>text</Red>
 * ```
 * as
 * ```html
 * <h1 style="color:red;">text</h1>
 * ```
 */
export const styled: TemplateStringFunction<StylerComponent> = (strings: TemplateStringsArray, ...values: any[]) => {
  return tagged`${defaultTagName}`(strings, ...values);
};

/**
 * <ReactElement style={stylobj`color:red;`}></ReactElement>
 * <ReactElement style={css`color:red;`}></ReactElement>
 */
export const css: TemplateStringFunction<React.CSSProperties> = (strings: TemplateStringsArray, ...values: any[]) => {
  const string = toString(strings, ...values);
  return toCSSProperties(string);
};

export default styled;

export * from "./tostring.js";
export * from "./utils.js";
