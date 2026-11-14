import { ParamType } from '@uirouter/react';

const decode = (value: string): string => {
  const spaced = value.replace(/\+/g, ' ');
  try {
    return decodeURIComponent(spaced);
  } catch {
    // A malformed escape is passed on as sent; the backend refuses it.
    return spaced;
  }
};

/**
 * A query value as an OAuth client sends it: form-encoded, so "+" is a space.
 * ui-router decodes with decodeURIComponent alone, which would hand
 * "mcp:read+mcp:staff" to the backend as a single unknown scope.
 */
export const formEncodedParam = new ParamType({
  // Skips ui-router's own decoding, so `decode` sees the raw value.
  raw: true,
  is: (value) => typeof value === 'string',
  encode: (value: string) => encodeURIComponent(value),
  decode,
  equals: (a, b) => a === b,
});
