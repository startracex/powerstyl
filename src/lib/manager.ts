import hash from "./hash.ts";

export const managerTypes = {
  inline: "inline",
  scoped: "scoped",
  global: "global",
  adopted: "adopted",
} as const;

const createStyleElement = () => document.createElement("style");

abstract class MicrotaskScheduler {
  protected needsUpdate: boolean = false;
  protected isScheduled: boolean = false;

  abstract update(): void;

  protected scheduleUpdate(): void {
    this.needsUpdate = true;
    if (this.isScheduled) {
      return;
    }
    this.isScheduled = true;

    queueMicrotask(() => {
      if (this.needsUpdate) {
        this.update();
        this.needsUpdate = false;
      }
      this.isScheduled = false;
    });
  }

  protected cancelPendingUpdate(): void {
    this.needsUpdate = false;
    this.isScheduled = false;
  }
}

export class GlobalManager extends MicrotaskScheduler {
  container: HTMLElement;
  style: HTMLStyleElement;
  cache: Map<string, { css: string; refCount: number }>;

  constructor(container: HTMLElement) {
    super();
    this.container = container;
    this.style = createStyleElement();
    this.container.appendChild(this.style);
    this.cache = new Map();
  }

  set(key: string, css: string): void {
    const existValue = this.cache.get(key);
    if (existValue) {
      existValue.refCount++;
    } else {
      this.cache.set(key, { css, refCount: 1 });
      this.scheduleUpdate();
    }
  }

  delete(key: string): void {
    const existValue = this.cache.get(key);
    if (!existValue) {
      return;
    }
    existValue.refCount--;
    if (existValue.refCount === 0) {
      this.cache.delete(key);
      this.scheduleUpdate();
    }
  }

  hash(str: string): string {
    return hash(str).toString(16).padStart(8, "0");
  }

  prepare(cssText: string, element?: HTMLElement): { css: string; applyOptions: false | { key: string } } {
    const key = this.hash(cssText);
    const selector = `[data-ps="${key}"]`;
    const css = `${selector}{${cssText}}`;
    let applyOptions: boolean | { key: string };
    element.dataset.ps = key;
    if (this.cache.has(key)) {
      applyOptions = false;
    } else {
      applyOptions = { key };
    }
    return {
      css,
      applyOptions,
    };
  }

  applyStyle(css: string, { key = css }: { key?: string } = {}): void {
    if (this.cache.has(key)) {
      return;
    }
    this.set(key, css);
  }

  clear(): void {
    this.cancelPendingUpdate();
    this.style.textContent = "";
    this.cache.clear();
  }

  update(): void {
    this.style.textContent = [...this.cache.values().map((v) => v.css)].join("");
  }
}

export class AdoptedManager extends MicrotaskScheduler {
  container: HTMLElement;
  index?: number;
  sheet?: CSSStyleSheet;
  current: string = "";

  constructor(container: HTMLElement) {
    super();
    this.container = container;
  }

  prepare(cssText: string, element?: HTMLElement): { css: string; applyOptions?: false | {} } {
    const css = `:host{${cssText}}`;
    return {
      css,
      applyOptions: this.current === css ? false : {},
    };
  }

  applyStyle(css: string, { index }: { index?: number } = {}): void {
    if (this.current === css) {
      return;
    }
    this.current = css;
    if (index !== undefined && this.index === undefined) {
      this.index = index;
    }
    this.scheduleUpdate();
  }

  clear(): void {
    this.cancelPendingUpdate();
    this.current = "";
    if (this.sheet && this.index !== undefined) {
      const sheets = this.container.shadowRoot.adoptedStyleSheets;
      this.container.shadowRoot.adoptedStyleSheets = [...sheets.slice(0, this.index), ...sheets.slice(this.index + 1)];
      this.sheet = undefined;
      this.index = undefined;
    }
  }

  update(): void {
    if (!this.current) {
      return;
    }
    if (this.sheet) {
      this.sheet.replaceSync(this.current);
      return;
    }
    this.sheet = new CSSStyleSheet();
    this.sheet.replaceSync(this.current);
    const sheets = this.container.shadowRoot.adoptedStyleSheets;
    const finalIndex = this.index ?? sheets.length;
    this.container.shadowRoot.adoptedStyleSheets = [...sheets.slice(0, finalIndex), this.sheet, ...sheets.slice(finalIndex)];
  }
}

export class ScopedManager extends MicrotaskScheduler {
  container: HTMLElement;
  style: HTMLStyleElement;
  current: string = "";

  constructor(container: HTMLElement) {
    super();
    this.container = container;
    this.style = createStyleElement();
    this.container.insertBefore(this.style, this.container.firstChild);
  }

  prepare(cssText: string, element?: HTMLElement): { css: string; applyOptions?: false | {} } {
    const css = `@scope{:scope{${cssText}}}`;
    return {
      css,
      applyOptions: this.current === css ? false : {},
    };
  }

  applyStyle(css: string, _?: any): void {
    if (this.current === css) {
      return;
    }
    this.current = css;
    this.scheduleUpdate();
  }

  clear(): void {
    this.cancelPendingUpdate();
    this.style.textContent = "";
    this.current = "";
  }

  update(): void {
    this.style.textContent = this.current;
  }
}
