import { connect } from 'react-redux';

import { RootState } from '@waldur/store/reducers';

import { LanguageUtilsService } from './LanguageUtilsService';
import { Translate, TranslateProps } from './types';

export const formatTemplate: Translate = (template, context) =>
  context ? template.replace(/{(.+?)}/g, (_, key) => context[key]) : template;

const translateFilter = (template) =>
  LanguageUtilsService.dictionary[template] || template;

export const translate: Translate = (template, context) =>
  formatTemplate(translateFilter(template), context);

export const getLocale = (state: RootState) => ({
  locale: state.locale,
  translate,
});

export const withTranslation = connect<TranslateProps>(getLocale);
