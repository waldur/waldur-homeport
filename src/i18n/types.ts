type Interpolator = (template: string, context?: {}) => any;

export type Translate = (
  template: string,
  context?: {},
  interpolator?: Interpolator,
) => string;
