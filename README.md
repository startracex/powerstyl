# powerstly

## Introduction

Convert template string to css properties for `style`

```jsx
import { css } from "powersty";
<ReactElement style={css`
  // CSS text
`} />
```

Apply styles to a React element or child element via a template string

```jsx
import powerstyl from "powersty";

const FlexContainer = powerstyl`
  display:flex
`;

<FlexContainer>...</FlexContainer>;

// <div style="display:flex">
//   ...
// </div>
```

<details>

```js
import { styled, tagged, inlined } from "powersty";
```

<div style="color:red; ">styled</div>

```jsx
const Red = styled`
  color: red; 
`;
<Red>styled</Red>;
/* <div style="color:red;">styled</div> */
```

<div style="color:blue; ">tagged</div>

```jsx
const Blue = tagged`div``
  color: blue; 
`;
<Blue>tagged</Blue>;
/* <div style="color:blue;">tagged</div> */
```

<div style="color:green; ">inlined</div>

```jsx
const Green = inlined`
  color: green; 
`;
<Green>
  <div>text</div>
</Green>;
/* <div style="color:green;">inlined</div> */
```

</details>

Works with CSS preprocessors

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

With options

```js
const lessStyle = less(options)`
// ... less code
`;
const sassStyle = sass(options)`
// ... sass code
`;
```
