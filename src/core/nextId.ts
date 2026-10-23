let counter = 0;

/**
 * An id unique within this page load: `prefix` followed by a number that
 * counts up across all prefixes, like lodash's uniqueId. For DOM ids inside
 * a component, use React's useId instead. Ids stored across page loads must
 * still be checked against the stored ones, as the counter restarts.
 */
export const nextId = (prefix = '') => `${prefix}${++counter}`;
