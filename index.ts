import toString, { type TemplateStringFunction } from "./tostring.js";
import {
  createInlined,
  createTagged,
  toCSSProperties,
  type StylerComponent,
} from "./create.js";

const inlined: TemplateStringFunction<StylerComponent> = (
  strings: TemplateStringsArray,
  ...values: any[]
) => {
  const string = toString(strings, ...values);
  return createInlined(string);
};

const styled: TemplateStringFunction<
  TemplateStringFunction<StylerComponent>
> = (strings: TemplateStringsArray, ...values: any[]) => {
  const tagName = toString(strings, ...values);
  return (strings: TemplateStringsArray, ...values: any[]) => {
    const string = toString(strings, ...values);
    return createTagged(tagName, string);
  };
};

const css: TemplateStringFunction<React.CSSProperties> = (
  strings: TemplateStringsArray,
  ...values: any[]
) => {
  const string = toString(strings, ...values);
  return toCSSProperties(string);
};

const tagged = styled;

export { toString, createInlined, createTagged, toCSSProperties };

export { inlined, styled, css, tagged };

export default styled;
