import { Fragment } from 'react';
import { connect } from 'react-redux';

import { RootState } from '@waldur/store/reducers';

import { LanguageUtilsService } from './LanguageUtilsService';
import { Translate, TranslateProps } from './types';

export const formatJsxTemplate = (template, context) => {
  if (!context) {
    return template;
  }
  const result = (
    <Fragment>
      {template.split(/\{|\}/g).map((part, index) => (
        <Fragment key={index}>
          {index % 2 === 0 ? part : context[part]}
        </Fragment>
      ))}
    </Fragment>
  );
  return result;
};

export const formatJsx = (template, context) => {
  const iterator = template.matchAll(/<([^>]+)>([^<]+)<\/([^>]+)>/g);
  const children = [];
  let match,
    prevIndex = 0;
  do {
    match = iterator.next();
    if (match.done) {
      break;
    }
    children.push(template.substring(prevIndex, match.value.index));
    children.push(context[match.value[1]](match.value[2]));
    prevIndex = match.value[0].length + match.value.index;
  } while (!match.done);
  if (prevIndex !== template.length) {
    children.push(template.substring(prevIndex));
  }
  return <Fragment>{children}</Fragment>;
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
