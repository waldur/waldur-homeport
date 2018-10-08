export type Translate = (template: string, context?: {}) => string;

export interface TranslateProps {
  translate: Translate;
  locale?: string;
}
