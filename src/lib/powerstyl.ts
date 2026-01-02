import { AdoptedManager, GlobalManager, managerTypes, ScopedManager } from "./manager.ts";

interface Constructor<T, A extends any[] = any[]> {
  new (...args: A): T;
}

export interface StyledFn<Args extends any[], Return, Tag, Values> {
  (...args: Args): Return;
  [metadataSymbol]: StyledMetadata<Tag, Values>;
}

export interface StyledMetadata<Tag, Values> {
  tag: Tag;
  extends: { strings: TemplateStringsArray; values: Values }[];
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
  | ({
      type?: "adopted";
      manager?: AdoptedManager;
    } & Parameters<AdoptedManager["applyStyle"]>[1])
  | ({
      type?: "global";
      manager?: GlobalManager;
    } & Parameters<GlobalManager["applyStyle"]>[1]);

let globalManager: GlobalManager;

const styledMap = new WeakMap<HTMLElement, () => void>();

const metadataSymbol: unique symbol = Symbol();

const getMetadata = (tag: any): StyledMetadata<any, any[]> => {
  const tagMetadata = isFunction(tag) ? tag[metadataSymbol] || {} : {};
  return {
    tag: tagMetadata.tag ?? tag,
    extends: tagMetadata.extends || [],
  };
};

const isFunction = (value: any): value is Function => typeof value === "function";

const functionIsConstructor = (value: Function): value is Constructor<any> => value.prototype?.constructor === value;

const joinParts = <T>(strings: TemplateStringsArray, values: T[], fn: (arg0: T) => string): string =>
  values.length ? strings.reduce((acc, cur, i) => acc + cur + (i < values.length ? fn(values[i]) || "" : ""), "") : strings[0];

export class Powerstyl {
  createElement<E extends HTMLElement = HTMLElement, A extends any[] = any[], N extends string = string>(
    tag: N | Constructor<E, A> | ((...args: A) => E),
    args: A
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
    tag: N | Constructor<E, A> | ((...args: A) => E),
    options: ApplyStyleOptions = {}
  ): (
    strings: TemplateStringsArray,
    ...values: StyledPartValue<NamedElement<N, E>>[]
  ) => StyledFn<A, NamedElement<N, E>, typeof tag, StyledPartValue<NamedElement<N, E>>[]> {
    return (strings, ...values) => {
      const tagMetadata: StyledMetadata<typeof tag, StyledPartValue<NamedElement<N, E>>[]> = getMetadata(tag);
      const finalTag = tagMetadata.tag;
      const finalExtends = [...tagMetadata.extends, { strings, values }];

      const styledFn: StyledFn<A, NamedElement<N, E>, typeof tag, StyledPartValue<NamedElement<N, E>>[]> = (...args: A) => {
        const element = this.createElement(finalTag, args);
        options.type ??= element.shadowRoot ? managerTypes.adopted : managerTypes.scoped;
        options.manager ??= this.getManager(element, options.type);

        const hasFunction = finalExtends.some(({ values }) => values.some((v) => isFunction(v)));
        const partValueToString = hasFunction
          ? (value: StyledPartValue<NamedElement<N, E>>): string => {
              if (isFunction(value)) {
                return "" + value.call(element, element);
              }
              return "" + value;
            }
          : String;
        const templateObjectToString = ({ strings, values }) => joinParts(strings, values, partValueToString);

        const updateStyle = () => {
          this.applyStyle(element, finalExtends.map(templateObjectToString).join(""), options);
        };
        updateStyle();

        if (hasFunction) {
          styledMap.set(element, updateStyle);
        }
        return element;
      };

      styledFn[metadataSymbol] = {
        tag: finalTag,
        extends: finalExtends,
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
    const { css, applyOptions } = manager.prepare(cssText, element);
    if (applyOptions) {
      manager.applyStyle(this.transform(css), { ...applyOptions, ...restOptions });
    }
  }

  updateStyle(element: HTMLElement): void {
    styledMap.get(element)?.();
  }

  transform(s: string): string {
    return s;
  }

  getManager(element: HTMLElement, type?: keyof typeof managerTypes): ScopedManager | GlobalManager | AdoptedManager | undefined {
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
