export type TemplateStringFunction<T> = (strings: TemplateStringsArray, ...values: any[]) => T;

export function toString(strings: TemplateStringsArray, ...values: any[]): string {
  return strings.reduce((prev, cur, index) => prev + cur + (values[index] || ""), "");
}

export default toString;