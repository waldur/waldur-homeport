import { Fragment, ReactNode } from 'react';
import { connect } from 'react-redux';

import { RootState } from '@waldur/store/reducers';

import { LanguageUtilsService } from './LanguageUtilsService';
import { Translate, TranslateProps } from './types';

export const formatJsxTemplate = (template, context) => {
  if (!context) {
    return template;
  }
  return (
    <Fragment>
      {template.split(/\{|\}/g).map((part, index) => (
        <Fragment key={index}>
          {index % 2 === 0 ? part : context[part]}
        </Fragment>
      ))}
    </Fragment>
  );
};

export const formatJsx = (
  template: string,
  context: Record<string, (s: string) => ReactNode>,
) => {
  const pattern = /<([^>]+)>([^<]*)<\/([^>]+)>/g;
  const parts = [];
  let matches,
    prevIndex = 0;
  while ((matches = pattern.exec(template)) !== null) {
    parts.push(template.substring(prevIndex, matches.index));
    parts.push(context[matches[1]](matches[2]));
    prevIndex = matches[0].length + matches.index;
  }
  if (prevIndex !== template.length) {
    parts.push(template.substring(prevIndex));
  }
  return (
    <Fragment>
      {parts.map((part, index) => (
        <Fragment key={index}>{part}</Fragment>
      ))}
    </Fragment>
  );
};

export const formatTemplate: Translate = (template, context) =>
  context ? template.replace(/{(.+?)}/g, (_, key) => context[key]) : template;

export const translateTemplate = (template) =>
  LanguageUtilsService.dictionary[template] || template;

export const translate: Translate = (
  template,
  context,
  interpolator = formatTemplate,
) => interpolator(translateTemplate(template), context);

export const getLocale = (state: RootState) => ({
  locale: state.locale,
  translate,
});

export const withTranslation = connect<TranslateProps>(getLocale);
