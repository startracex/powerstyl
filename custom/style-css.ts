import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
export default class StyleCss extends LitElement {
  @property({ type: String }) src = "";
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) contenteditable = "false";
  @property({ type: Object }) element: any = null;
  @property({ type: Function }) useCss = async (input: string) => input;
  static styles = css`:host{display:none}:host([contenteditable]){display:block}`;
  render() {
    return html`<slot></slot><slot name="style"></slot>`;
  }
  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    const style = document.createElement("style");
    style.slot = "style";
    this.element = style;
    this.appendChild(this.element);
    if (this.src) {
      const res = await fetch(this.src);
      this.data = await res.text();
    } else {
      this.data = this.textContent?.trim() || "";
    }
  }
  protected firstUpdated(): void {
    if (this.contenteditable) {
      this.addEventListener("input", async () => {
        const nodes = this.shadowRoot?.querySelector("slot")?.assignedNodes();
        const text = nodes?.map((node) => node.textContent).join("") || "";
        this.data = await this.useCss(text);
      });
    }
  }
  get data() {
    return this.disabled ? "" : this.element.textContent || "";
  }
  set data(e) {
    this.element.textContent = this.disabled ? "" : e;
  }
}
if (!customElements.get("style-css")) customElements.define("style-css", StyleCss);
