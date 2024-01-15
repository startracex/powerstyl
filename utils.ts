import React, { type CSSProperties } from "react";

export type StylerComponent = (props: any) => React.ReactElement<{
  style: React.CSSProperties;
}, string | React.JSXElementConstructor<any>>;

export function createTagged(tagName: string, cssText: string): StylerComponent {
  const style = toCSSProperties(cssText);
  return (props: any) => {
    return React.createElement(tagName, { style }, props.children);
  };
}

export function createInlined(cssText: string): StylerComponent {
  const style = toCSSProperties(cssText);
  return (props: any) => {
    return React.cloneElement(props.children, { style });
  };
}

export function toCSSProperties(cssText: string): CSSProperties {
  const noComments = cssText.replace(
    /\/\*[\s\S]*?\*\/|(?:[^:]|^)\/\/.*$/gm,
    ""
  );
  const styleRules = noComments.split(";");
  const style: {
    [key: string]: string;
  } = {};
  for (let i = styleRules.length - 1; i >= 0; i--) {
    const key = styleRules[i].split(":")[0]?.trim();
    const val = styleRules[i].split(":")[1]?.trim();
    if (key && val) {
      const keySplit = key.split("-");
      keySplit.map((v, i) => {
        if (i > 0) {
          keySplit[i] = v[0].toUpperCase() + v.slice(1);
        }
      });
      style[keySplit.join("")] = val;
    }
  }
  return Object.keys(style).length
    ? style
    : {
      display: "contents",
    };
}