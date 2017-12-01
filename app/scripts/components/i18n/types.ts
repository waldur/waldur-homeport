export type Translate = (template: string, context?: any) => string;

export type TranslateProps = {
  translate: Translate
};
