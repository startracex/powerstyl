import StyleCss from "./style-css.js";
import { property } from "lit/decorators.js";
import lessmodule from "less";
export default class StyleLess extends StyleCss {
  @property({ type: Function }) useCss = async (input: string) => (await lessmodule.render(input)).css;
}
if (!customElements.get("style-less")) customElements.define("style-less", StyleLess);