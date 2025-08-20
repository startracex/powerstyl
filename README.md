<h1>power<span style="color: rgb(10 240 220);">styl</span></h1>

A way to style elements in vanilla JavaScript.

## Installation

```bash
npm install powerstyl
```

## Getting Started

```js
import { styled, updateStyle } from "powerstyl";
```

```js
let count = 0;
const Button = styled("button")`
  font-size: 1em;
  padding: 0.2em 0.5em;
  border-radius: 0.2em;
  color: black;
  border: none;
  cursor: pointer;
  ${() => `background-color: ${count % 2 ? "rgb(10 240 220)" : "rgb(150, 240, 20)"};`}
  ${() => `&:hover {
    background-color: ${count % 2 ? "rgb(10 230 200);" : "rgb(150, 230, 0)"};
  }`};
`;
const ButtonLg = styled(Button)`
  font-size: 1.2em;
`;
const button = ButtonLg();
button.append("Click me");
button.addEventListener("click", () => {
  count++;
  updateStyle(button);
});

document.body.appendChild(button);
```

## API Reference

### `styled`

Create a function to create styled elements.

```js
styled(Tag, { type, manager, transform, selector, globalEffect });
```

#### Parameters

- `Tag`: An element tag name, custom element constructor, or function returns a element instance
- `options`
  - `type`: Style application type (`'global'` (default), `'scoped'`, `'adopted'` or `'inline'`)
  - `manager`: Style manager
  - `transform`: CSS transformation
  - `selector`: Enforced CSS selector
  - `globalEffect`: Global effect

### `updateStyle`

Updates the style of an element created by `styled`.

```js
updateStyle(element);
```

#### Parameters

- `element`: The element whose style needs to be updated which created by `styled` function

### `applyStyle`

Applies style to an element.

```js
applyStyle(element, cssText, options);
```

#### Parameters

- `element`: The element to apply style to
- `cssText`: CSS text content
- `options`: See [`styled`](#styled)'s `options`

## Style Application Types

### Global

Styles applied globally.

```js
const MyComponent = styled("div", {
  type: "global",
  globalEffect: (id, element) => {
    element.dataset.ps = id;
    return `[data-ps="${id}"]`;
  },
})`
  /* root styles */
  &:hover {
    /* hover styles */
  }
`;
MyComponent();
```

```html
<head>
  <style>
    [data-ps="11201b20"] {
      /* root styles */
    }
    [data-ps="11201b20"]:hover {
      /* hover styles */
    }
  </style>
</head>
<body>
  <div data-ps="11201b20"></div>
</body>
```

### Scoped

Styles applied within a scope.

```js
const MyComponent = styled("div", { type: "scoped" })`
  /* root styles */
  &:hover {
    /* hover styles */
  }
`;
MyComponent();
```

```html
<div>
  <style>
    @scope {
      :scope {
        /* root styles */
      }
      :scope:hover {
        /* hover styles */
      }
    }
  </style>
</div>
```

### Adopted

Styles applied within a shadow root.

```js
const MyComponent = styled("element-with-shadow-root", { type: "adopted" })`
  /* host styles */
  &:hover {
    /* hover styles */
  }
`;
MyComponent();
```

```css
:host {
  /* host styles */
}
:host(:hover) {
  /* hover styles */
}
```

### Inline

Styles applied directly as inline styles to the element.

```js
const MyComponent = styled("div", { type: "inline" })`
  /* inline styles */
`;
MyComponent();
```

```html
<div style="/* inline styles */"></div>
```
