// See also: https://github.com/erikras/redux-form/issues/1852
export const parseIntField = value => parseInt(value, 10) || 0;
export const formatIntField = value => value ? value.toString() : 0;
