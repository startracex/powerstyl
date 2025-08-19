import applyType from "./type-enum.ts";

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
  cache: Map<string, string>;

  constructor(container: HTMLElement) {
    super();
    this.container = container;
    this.style = createStyleElement();
    this.container.appendChild(this.style);
    this.cache = new Map();
  }

  set(key: string, css: string): void {
    this.cache.set(key, css);
    this.scheduleUpdate();
  }

  delete(key: string): void {
    if (!this.cache.delete(key)) {
      return;
    }
    this.scheduleUpdate();
  }

  applyStyle(css: string, { key = css }: { key?: string } = {}): void {
    if (this.cache.has(key)) {
      return;
    }
    this.set(key, css);
  }

  update(): void {
    this.style.textContent = [...this.cache.values()].join("");
  }

  clear(): void {
    this.cancelPendingUpdate();
    this.style.textContent = "";
    this.cache.clear();
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

  applyStyle(css: string): void {
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

let globalManager: GlobalManager;
export const getManager = (
  element: HTMLElement,
  options: {
    type?: (typeof applyType)[keyof typeof applyType];
  }
): ScopedManager | GlobalManager | AdoptedManager | undefined => {
  switch (options.type) {
    case applyType.scoped:
      return new ScopedManager(element);
    case applyType.global:
      return (globalManager ??= new GlobalManager(document.head));
    case applyType.adopted:
      return new AdoptedManager(element);
  }
};
