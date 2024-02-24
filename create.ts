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
  const noComments = cssText.replace(/\/\*[\s\S]*?\*\/|(?:[^:]|^)\/\/.*$/gm, "");
  const styleRules = noComments.split(";");
  const style = {} as any;
  for (let rule of styleRules) {
    const [key, val] = rule.split(":").map((part) => part.trim());
    if (key && val) {
      const formattedKey = key.replace(/-([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      style[formattedKey] = val;
    }
  }
  return Object.keys(style).length
    ? style
    : {
      display: "contents",
    };
}