import { createElement, type Constructor, isFunction, withSelector, _host, _scope, joinParts } from "./lib/shared.ts";
import { AdoptedManager, getManager, GlobalManager, ScopedManager } from "./lib/manager.ts";
import transformer from "./lib/transformer.ts";
import applyType from "./lib/type-enum.ts";
import hash from "./lib/hash.ts";

const styledMap = new WeakMap<HTMLElement, () => void>();

export const updateStyle = (element: HTMLElement): void => {
  styledMap.get(element)?.();
};

const dataPsEffect = (id: string, element: HTMLElement): string => {
  element.dataset.ps = id;
  return `[data-ps="${id}"]`;
};

type ApplyStyleOptions = (
  | {
      type?: "scoped";
      manager?: ScopedManager;
    }
  | {
      type?: "global";
      manager?: GlobalManager;
    }
  | {
      type?: "adopted";
      manager?: AdoptedManager;
    }
  | {
      type?: "inline";
      manager?: undefined;
    }
) & {
  transform?: (css: string) => string;
  selector?: string;
};

export const applyStyle = (element: HTMLElement, cssText: string, options: ApplyStyleOptions): void => {
  if (options.type === applyType.inline) {
    element.style.cssText = cssText;
    return;
  }
  options.type ??= element.shadowRoot ? applyType.adopted : applyType.scoped;
  const { type, selector, transform = transformer.transform, manager } = options;
  if (type === applyType.scoped) {
    const css = withSelector(selector ?? ":" + _scope, cssText);
    manager.applyStyle(transform(`@${_scope}{${css}}`));
    return;
  }
  if (type === applyType.global) {
    const css = transform(withSelector(selector, cssText));
    manager.applyStyle(css, { key: selector });
    return;
  }
  if (type === applyType.adopted && element.shadowRoot) {
    const css = withSelector(selector ?? ":" + _host, cssText);
    manager.applyStyle(transform(css));
  }
};

const styledMeta: unique symbol = Symbol();

type NamedElement<N, E> = N extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[N] : E;

type TypeOrReturnType<T extends (...args: any) => any> = ReturnType<T> | T;

export const styled = <
  E extends HTMLElement = HTMLElement, //
  A extends any[] = any[],
  N extends string = string,
  D = NamedElement<N, E>,
  P = TypeOrReturnType<(element: D) => string | number>
>(
  Tag: N | Constructor<E, A> | ((...args: A) => E),
  options: ApplyStyleOptions & {
    globalEffect?: (hash: string, element: HTMLElement) => string;
  } = {}
): ((
  strings: TemplateStringsArray,
  ...values: P[]
) => ((...args: A) => D) & {
  [styledMeta]: {
    tag: typeof Tag;
    extends: { strings: TemplateStringsArray; values: P[] }[];
  };
}) => {
  options.type ??= applyType.global;
  options.globalEffect ??= dataPsEffect;
  return (strings, ...values): any => {
    const tagMetadata: {
      tag: typeof Tag;
      extends: { strings: typeof strings; values: typeof values }[];
    } = isFunction(Tag) ? Tag[styledMeta] || {} : {};

    const func = (...args: A) => {
      const element = createElement(tagMetadata.tag ?? Tag)(...args);
      options.manager ??= getManager(element, options);
      let hasFunction = false;
      const partValueToString = (value: P) => {
        if (isFunction(value)) {
          hasFunction = true;
          return value.call(element, element);
        }
        return value;
      };
      const stateToString = (extend: (typeof tagMetadata.extends)[number]) => joinParts(extend.strings, extend.values, partValueToString);
      const updateStyle = () => {
        const cssText = (tagMetadata.extends || []).map(stateToString).join("") + joinParts(strings, values, partValueToString);
        if (options.type === applyType.global) {
          const hashString = hash(cssText).toString(16);
          const effectReturn = options.globalEffect(hashString, element);
          options.selector = effectReturn;
        }
        applyStyle(element, cssText, options);
      };
      updateStyle();
      if (hasFunction) {
        styledMap.set(element, updateStyle);
      }
      return element as D;
    };

    func[styledMeta] = {
      tag: tagMetadata.tag || Tag,
      extends: [
        ...(tagMetadata.extends || []),
        {
          strings,
          values,
        },
      ],
    };
    return func;
  };
};
