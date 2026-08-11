export interface LanguageOption {
  code: string;
  label: string;
  display_code?: string;
}

type Interpolator = (template: string, context?: {}) => any;

export type Translate = (
  template: string,
  context?: {},
  interpolator?: Interpolator,
) => string;

/**
 * Hook run on every translation key before dictionary lookup — e.g. a host
 * app's deployment-specific terminology overrides. Defaults to identity.
 */
export type MessageTransform = (message: string) => string;
