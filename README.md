# powerstly

Style with template strings.

```sh
npm i powerstyl
```

Convert a CSS string to an object.

```jsx
import { css } from "powersty";
<ReactElement
  style={css`
    // CSS text
  `}
/>;
```

Apply a style to a react element.

```jsx
import powerstyl from "powersty";

const FlexContainer = powerstyl`main``
  display:flex;
`;

<FlexContainer>...</FlexContainer>;

/* 
<main style="display:flex">
  ...
</main>
 */
```

```js
import { styled, inlined } from "powersty";
```

`styled` accepts an element name and its CSS.

```jsx
const Red = styled`
  color: red; 
`;

<Red>text</Red>;

/* 
  <div style="color:red;">text</div>
 */
```

`inlined` applies a style to the child element.

```jsx
const Green = inlined`
  color: green; 
`;

<Green>
  <div>text</div>
</Green>;

/* 
  <div style="color:green;">text</div>
 */
```

With CSS preprocessors (sync).

```js
import less from "powersty/less";
import sass from "powersty/sass";

const lessStyle = less`
// ... less code
`;
const sassStyle = sass`
// ... sass code
`;
```

With options.

```js
const lessStyle = less(options)`
// ... less code
`;
const sassStyle = sass(options)`
// ... sass code
`;
```
