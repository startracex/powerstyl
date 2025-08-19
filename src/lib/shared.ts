export const _host = "host";
export const _scope = "scope";

export const isFunction = (value: any): value is Function => typeof value === "function";

export const isClass = (value: any): value is new (...args: any[]) => any => isFunction(value) && value.prototype?.constructor === value;

export interface Constructor<T, A extends any[] = any[]> {
  new (...args: A): T;
}

export const createElement = <T extends HTMLElement = HTMLElement, A extends any[] = any[], K extends string = string>(
  Tag: K | Constructor<T, A> | ((...args: A) => T)
): ((...args: A) => K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : T) => {
  if (isClass(Tag)) {
    return (...args: any[]) => new Tag(...(args as A)) as any;
  }
  if (isFunction(Tag)) {
    return Tag as any;
  }
  return () => document.createElement(Tag) as any;
};

export const withSelector = (selector: string, css: string): string => (selector ? `${selector}{${css}}` : css);

export const joinParts = <T>(strings: TemplateStringsArray, values: T[], fn: (arg0: T) => string): string =>
  values.length ? strings.reduce((acc, cur, i) => acc + cur + (fn(values[i]) || ""), "") : strings[0];
