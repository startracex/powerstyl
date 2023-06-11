import React from "react";
import C from "./style-css.js";
import L from "./style-less.js";
import { createComponent } from "@lit-labs/react";
export const StyleCss = createComponent({
  tagName: 'style-css',
  elementClass: C,
  react: React
});
export default StyleCss;
export const StyleLess = createComponent({
  tagName: 'style-less',
  elementClass: L,
  react: React
});