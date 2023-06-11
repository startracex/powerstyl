export function tostring(strings: TemplateStringsArray, ...values: any[]): string {
  return strings.reduce((prev, cur, index) => prev + cur + (values[index] || ""), "");
}

export default tostring;