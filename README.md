# powerstly

## Introduction

Allows you to parse template literals (template strings) using CSS preprocessors and HTML tags to parse sources directly to CSS

```js
import less from "powersty/other/less"
import sass from "powersty/other/sass"
import stylus from "powersty/other/stylus"
const lessStyle = less`
  @color: #FFFFFF;
  header {
    color: @color;
    h1{
      background-color: @color;
    }
  }
`;
const sassStyle = sass`
// ... sass code
`;
const stylusStyle = stylus`
// ... stylus code
`;
```

Allows you to apply styles to a react element or child element via a template string

```jsx
import { styled, tagged, inlined } from "powersty";
/* <div style="color:red;">text</div> */
const Red = styled`
  color: red; 
`; 
<Red>text</Red>; 

/* <h1 style="color:blue;">text</h1> */
const Blue = tagged`h1``
  color: blue; 
`; 
<Blue>text</Blue>; 

/* <span style="color:green;">text</span> */
const Green = inlined`
  color: green; 
`;
<Green><span>text</span></Green>; 
```

Add extended custom elements of style

```html
<style-css>
    p {
    color: red;
    }
</style-css>
<p>red</p>
```

in react

```jsx
import { StyleCss } from "powerstyl/react";
<StyleCss>
  {`
    p {
      color: red;
    }
  `}
</StyleCss>
<p>red</p>
```

Next.js - NOSSR

```jsx
import { StyleCss } from "powerstyl/react"; 
const NoSSR_StyleCSS = dynamic(() => import('powerstyl/react'), { ssr: false }); 

<NoSSR_StyleCSS>
  {`
    p {
      color: red;
    }
  `}
</NoSSR_StyleCSS>
<p>red</p>
```
