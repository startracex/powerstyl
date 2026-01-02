<h1>power<span style="color: rgb(10 240 220);">styl</span></h1>

A way to style elements in vanilla JavaScript.

## Installation

```bash
npm install powerstyl
```

## Getting Started

Powerstyl mainly exports two things: `styled` and `updateStyle`.

`styled` is used to create an element creator.

`updateStyle` is used to update the style of the element created by the creator.
It should be placed where the state is updated.

If the parameters of `styled` do not contain functions, calling `updateStyle` on the created element will do nothing.

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
    background-color: ${count % 2 ? "rgb(10 230 200)" : "rgb(150, 230, 0)"};
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

<details>
<summary>Result</summary>

First updated:

```html
<head>
  <style>
    [data-ps="4606c706"] {
      font-size: 1em;
      padding: 0.2em 0.5em;
      border-radius: 0.2em;
      color: black;
      border: none;
      cursor: pointer;
      background-color: rgb(150, 240, 20);
      font-size: 1.2em;
    }
    [data-ps="4606c706"]:hover {
      background-color: rgb(150, 230, 0);
    }
  </style>
</head>
<body>
  <button data-ps="4606c706">Click me</button>
</body>
```

After clicked:

```html
<head>
  <style>
    [data-ps="4606c706"] {
      font-size: 1em;
      padding: 0.2em 0.5em;
      border-radius: 0.2em;
      color: black;
      border: none;
      cursor: pointer;
      background-color: rgb(150, 240, 20);
      font-size: 1.2em;
    }
    [data-ps="4606c706"]:hover {
      background-color: rgb(150, 230, 0);
    }
    [data-ps="f99b399b"] {
      font-size: 1em;
      padding: 0.2em 0.5em;
      border-radius: 0.2em;
      color: black;
      border: none;
      cursor: pointer;
      background-color: rgb(10 240 220);
      font-size: 1.2em;
    }
    [data-ps="f99b399b"]:hover {
      background-color: rgb(10 230 200);
    }
  </style>
</head>
<body>
  <button data-ps="f99b399b">Click me</button>
</body>
```

</details>

## API Reference

### `styled`

Create a function to create styled elements.

```js
styled(tag, { type, manager });
```

#### Parameters

- `tag`: An element tag name, custom element constructor, or function returns a element instance.
- `options`
  - `type`: Style application type (`'global'`, `'scoped'`, `'adopted'` or `'inline'`).
  - `manager`: Style manager, used to update DOM and application styles.

### `updateStyle`

Updates the style of an element **created by** `styled`.

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
