export const getStateId = () =>
  encodeURIComponent(Math.random().toString(36).substr(2));
