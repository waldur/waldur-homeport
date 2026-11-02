const SPACE_CLASSES = {
  0: 'mb-0',
  1: 'mb-1',
  1.5: 'mb-1.5',
  2.5: 'mb-2.5',
  3: 'mb-3',
  4: 'mb-4',
  5.5: 'mb-5.5',
  6: 'mb-6',
} as const;

/** Bottom-margin steps a `summary` row can take. */
export type PropertySpace = keyof typeof SPACE_CLASSES;

export { SPACE_CLASSES };
