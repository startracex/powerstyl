import { AdoptedManager, GlobalManager, managerTypes, ScopedManager } from "./manager.ts";

type Constructor<T, A extends any[] = any[]> = new (...args: A) => T;

export interface StyledFn<Args extends any[], Return, Tag, Values> {
  (...args: Args): Return;
  [metadataSymbol]: StyledMetadata<Tag, Values>;
}

export interface StyledMetadata<Tag, Values> {
  tag: Tag;
  extends: { strings: TemplateStringsArray; values: Values }[];
  isStatic: boolean;
}

export type StyledPartValue<T> = string | number | ((this: T, element: T) => string | number);

export type NamedElement<K, T> = K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : T;

type ApplyStyleOptions =
  | {
      type?: "inline";
      manager?: undefined;
    }
  | {
      type?: "scoped";
      manager?: ScopedManager;
    }
  | {
      type?: "adopted";
      manager?: AdoptedManager;
      index?: number;
    }
  | {
      type?: "global";
      manager?: GlobalManager;
    };

const isFunction = (value: any): value is Function => typeof value === "function";

const functionIsConstructor = (value: Function): value is Constructor<any> => value.prototype?.constructor === value;

const joinParts = <T>(strings: TemplateStringsArray, values: T[], fn: (arg0: T) => string): string =>
  values.length
    ? strings.reduce((acc, cur, i) => acc + cur + (i < values.length ? fn(values[i]) || "" : ""), "")
    : strings[0];

let globalManager: GlobalManager;

const styledMap = new WeakMap<HTMLElement, () => void>();

const metadataSymbol: unique symbol = Symbol();

const getMetadata = (tag: any): StyledMetadata<any, any[]> => {
  const tagMetadata = isFunction(tag) ? tag[metadataSymbol] : undefined;
  return {
    isStatic: tagMetadata?.isStatic || false,
    tag: tagMetadata?.tag ?? tag,
    extends: tagMetadata?.extends ? [...tagMetadata.extends] : [],
  };
};

export class Powerstyl {
  createElement<E extends HTMLElement = HTMLElement, A extends any[] = any[], N extends string = string>(
    tag: N | Constructor<E, A> | ((...args: A) => E),
    args: A,
  ): NamedElement<N, E> {
    if (isFunction(tag)) {
      if (functionIsConstructor(tag)) {
        return new tag(...args) as NamedElement<N, E>;
      }
      return tag(...args) as NamedElement<N, E>;
    }
    return document.createElement(tag) as NamedElement<N, E>;
  }

  styled<E extends HTMLElement = HTMLElement, A extends any[] = any[], N extends string = string>(
    tag?: N | Constructor<E, A> | ((...args: A) => E),
    options: ApplyStyleOptions = {},
  ): (
    strings: TemplateStringsArray,
    ...values: StyledPartValue<NamedElement<N, E>>[]
  ) => StyledFn<A, NamedElement<N, E>, typeof tag, StyledPartValue<NamedElement<N, E>>[]> {
    return (strings, ...values) => {
      const tagMetadata: StyledMetadata<typeof tag, StyledPartValue<NamedElement<N, E>>[]> = getMetadata(tag);
      const finalTag = tagMetadata.tag;
      const finalExtends = [...tagMetadata.extends, { strings, values }];
      // Base stylers (no parent extends) are static when they have no function values.
      const isStatic = !values.some(isFunction) && (tagMetadata.extends.length === 0 || tagMetadata.isStatic);

      let staticCssText: string | undefined;

      const buildCssText = (element: NamedElement<N, E>): string => {
        if (isStatic && staticCssText !== undefined) {
          return staticCssText;
        }

        const partValueToString = isStatic
          ? String
          : (value: StyledPartValue<NamedElement<N, E>>): string =>
              String(isFunction(value) ? value.call(element, element) : value);

        const cssText = finalExtends
          .map(({ strings, values }) => joinParts(strings, values, partValueToString))
          .join("");
        if (isStatic) {
          staticCssText = cssText;
        }
        return cssText;
      };

      const styledFn = ((...args: A) => {
        const element = this.createElement(finalTag as N | Constructor<E, A> | ((...args: A) => E), args);
        const type = options.type ?? (element.shadowRoot ? managerTypes.adopted : managerTypes.scoped);
        const manager = options.manager ?? this.getManager(element, type);
        const resolvedOptions = { ...options, type, manager } as ApplyStyleOptions;

        const updateStyle = () => {
          this.applyStyle(element, buildCssText(element), resolvedOptions);
        };
        updateStyle();

        if (!isStatic) {
          styledMap.set(element, updateStyle);
        }
        return element;
      }) as StyledFn<A, NamedElement<N, E>, typeof tag, StyledPartValue<NamedElement<N, E>>[]>;

      styledFn[metadataSymbol] = {
        tag: finalTag,
        extends: finalExtends,
        isStatic,
      };
      return styledFn;
    };
  }

  applyStyle(element: HTMLElement, cssText: string, options: ApplyStyleOptions = {}): void {
    const { manager, type, ...restOptions } = options;
    if (type === managerTypes.inline) {
      element.style.cssText = cssText;
      return;
    }
    if (!manager) {
      return;
    }
    const { css, applyOptions } = manager.prepare(cssText, element);
    if (applyOptions) {
      manager.applyStyle(css, {
        ...applyOptions,
        ...restOptions,
        transform: (s: string) => this.transform(s),
      });
    }
  }

  updateStyle(element: HTMLElement): void {
    styledMap.get(element)?.();
  }

  transform(s: string): string {
    return s;
  }

  getManager(
    element: HTMLElement,
    type?: keyof typeof managerTypes,
  ): ScopedManager | GlobalManager | AdoptedManager | undefined {
    switch (type) {
      case managerTypes.scoped:
        return new ScopedManager(element);
      case managerTypes.global:
        return (globalManager ??= new GlobalManager(document.head));
      case managerTypes.adopted:
        return new AdoptedManager(element);
    }
  }
}

export const mixin = <T extends (...args: any[]) => any>(styler0: T, ...stylers: any[]): T => {
  const result: any = (...a: any[]) => styler0(...a);
  const resultMetadata = getMetadata(styler0);
  for (const arg of stylers) {
    const argMetadata = getMetadata(arg);
    resultMetadata.isStatic &&= argMetadata.isStatic;
    resultMetadata.extends.push(...argMetadata.extends);
  }
  result[metadataSymbol] = resultMetadata;
  return result;
};
