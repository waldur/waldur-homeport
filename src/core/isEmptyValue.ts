/**
 * A field is missing when it is `undefined`, `null`, `''` or `[]`. `0` and
 * `false` are values. The one emptiness rule for data: property formats and
 * `renderFieldOrDash` both read it. (waldur-ui's `hasContent` asks a different
 * question, whether a rendered node shows anything, so `false` from a
 * `cond && <X />` value is empty there.)
 */
export const isEmptyValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);
