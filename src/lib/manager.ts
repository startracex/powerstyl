import hash from "./hash.ts";

export const managerTypes = {
  inline: "inline",
  scoped: "scoped",
  global: "global",
  adopted: "adopted",
} as const;

export type StyleTransform = (css: string) => string;

export interface ManagerApplyOptions {
  transform?: StyleTransform;
  key?: string;
  prevKey?: string;
  index?: number;
}

const createStyleElement = () => document.createElement("style");

abstract class MicrotaskScheduler {
  protected needsUpdate = false;
  protected isScheduled = false;

  abstract update(): void;

  protected scheduleUpdate(): void {
    this.needsUpdate = true;
    if (this.isScheduled) {
      return;
    }
    this.isScheduled = true;

    queueMicrotask(() => {
      this.isScheduled = false;
      if (this.needsUpdate) {
        this.needsUpdate = false;
        this.update();
      }
    });
  }

  protected cancelPendingUpdate(): void {
    this.needsUpdate = false;
  }
}

export class GlobalManager extends MicrotaskScheduler {
  container: HTMLElement;
  style: HTMLStyleElement;
  cache: Map<string, { css: string; refCount: number }>;
  private elementKeys = new WeakMap<HTMLElement, string>();
  private registry = new FinalizationRegistry<string>((key) => {
    this.delete(key);
  });

  constructor(container: HTMLElement) {
    super();
    this.container = container;
    this.style = createStyleElement();
    this.container.appendChild(this.style);
    this.cache = new Map();
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

  prepare(
    cssText: string,
    element: HTMLElement,
  ): { css: string; applyOptions: false | { key: string; prevKey?: string } } {
    const key = this.hash(cssText);
    const css = `[data-ps="${key}"]{${cssText}}`;
    const prevKey = this.elementKeys.get(element);

    if (prevKey === key) {
      return { css, applyOptions: false };
    }

    element.dataset.ps = key;
    this.elementKeys.set(element, key);

    if (prevKey !== undefined) {
      this.registry.unregister(element);
    }
    this.registry.register(element, key, element);

    return {
      css,
      applyOptions: prevKey !== undefined ? { key, prevKey } : { key },
    };
  }

  applyStyle(css: string, { key, prevKey, transform }: ManagerApplyOptions = {}): void {
    if (key === undefined) {
      return;
    }
    if (prevKey !== undefined) {
      this.delete(prevKey);
    }

    const existValue = this.cache.get(key);
    if (existValue) {
      existValue.refCount++;
      return;
    }

    this.cache.set(key, { css: transform ? transform(css) : css, refCount: 1 });
    this.scheduleUpdate();
  }

  clear(): void {
    this.cancelPendingUpdate();
    this.style.textContent = "";
    this.cache.clear();
  }

  update(): void {
    this.style.textContent = Array.from(this.cache.values(), (v) => v.css).join("");
  }
}

export class AdoptedManager {
  container: HTMLElement;
  index?: number;
  sheet?: CSSStyleSheet;
  current = "";

  constructor(container: HTMLElement) {
    if (!container.shadowRoot) {
      throw new Error("AdoptedManager requires an element with an open shadow root");
    }
    this.container = container;
  }

  prepare(cssText: string, _element?: HTMLElement): { css: string; applyOptions: false | Record<string, never> } {
    const css = `:host{${cssText}}`;
    return {
      css,
      applyOptions: this.current === css ? false : {},
    };
  }

  applyStyle(css: string, { index, transform }: ManagerApplyOptions = {}): void {
    if (this.current === css) {
      return;
    }
    this.current = css;
    if (index !== undefined && this.index === undefined) {
      this.index = index;
    }
    this.write(transform ? transform(css) : css);
  }

  clear(): void {
    this.current = "";
    if (this.sheet && this.index !== undefined) {
      const sheets = this.container.shadowRoot!.adoptedStyleSheets;
      this.container.shadowRoot!.adoptedStyleSheets = [...sheets.slice(0, this.index), ...sheets.slice(this.index + 1)];
      this.sheet = undefined;
      this.index = undefined;
    }
  }

  private write(css: string): void {
    if (!css) {
      return;
    }
    if (this.sheet) {
      this.sheet.replaceSync(css);
      return;
    }
    this.sheet = new CSSStyleSheet();
    this.sheet.replaceSync(css);
    const sheets = this.container.shadowRoot!.adoptedStyleSheets;
    const finalIndex = this.index ?? sheets.length;
    this.container.shadowRoot!.adoptedStyleSheets = [
      ...sheets.slice(0, finalIndex),
      this.sheet,
      ...sheets.slice(finalIndex),
    ];
  }
}

export class ScopedManager {
  container: HTMLElement;
  style: HTMLStyleElement;
  current = "";

  constructor(container: HTMLElement) {
    this.container = container;
    this.style = createStyleElement();
    this.container.insertBefore(this.style, this.container.firstChild);
  }

  prepare(cssText: string, _element?: HTMLElement): { css: string; applyOptions: false | Record<string, never> } {
    const css = `@scope{:scope{${cssText}}}`;
    return {
      css,
      applyOptions: this.current === css ? false : {},
    };
  }

  applyStyle(css: string, { transform }: ManagerApplyOptions = {}): void {
    if (this.current === css) {
      return;
    }
    this.current = css;
    this.style.textContent = transform ? transform(css) : css;
  }

  clear(): void {
    this.style.textContent = "";
    this.current = "";
  }
}
