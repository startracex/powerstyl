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
const Button = styled("button", { type: "global" })`
  font-size: 1em;
  padding: 0.2em 0.5em;
  border-radius: 0.2em;
  color: black;
  border: none;
  cursor: pointer;
  background-color: ${(e) => (e.count % 2 ? "rgb(10 240 220)" : "rgb(150, 240, 20)")};
  &:hover {
    background-color: ${(e) => (e.count % 2 ? "rgb(10 230 200)" : "rgb(150, 230, 0)")};
  }
`;
const ButtonLg = styled(Button, { type: "global" })`
  font-size: 1.2em;
`;
const button = ButtonLg();
button.count = 0;
button.append("Click me");
button.addEventListener("click", () => {
  button.count++;
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

If there are no functions in the template literals, calling `updateStyle` is a no-op.

It should be placed where the state is updated.

```js
updateStyle(element);
```

### `mixin`

Combines multiple style definitions into a single component, enabling composable styles.

It is useful for creating reusable atomic styles.

```js
mixin(styler0, ...stylers);
```

#### Parameters

- `styler0`: The first style definition.
- `stylers`: The rest of the style definitions.

#### Parameters

- `element`: The element whose style needs to be updated which created by `styled` function

## Style Application

### Global

Styles applied globally.

```js
const MyComponent = styled("div", {
  type: "global",
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

Styles applied within a opened shadow root.

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

## Style Mixins

```js
import { styled, mixin } from "powerstyl";

const Radius = styled()`
  border-radius: 0.2em;
`;

const Outline = styled()`
  outline: 1.5px solid black;
  border: none;
`;

const PrimaryButton = styled(
  mixin(
    styled("button")`
      font-size: 1.2em;
      cursor: pointer;
    `,
    Radius,
    Outline,
  ),
)`
  background-color: rgb(150, 240, 20);
`;

const button = PrimaryButton();
```

```css
font-size: 1.2em;
cursor: pointer;

border-radius: 0.2em;

outline: 1.5px solid black;
border: none;

background-color: rgb(150, 240, 20);
```
