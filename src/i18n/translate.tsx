import { connect } from 'react-redux';

import { $filter } from '@waldur/core/services';

import { Translate, TranslateProps } from './types';

export const formatTemplate: Translate = (template, context) => (
  context ? template.replace(/{(.+?)}/g, (_, key) => context[key]) : template
);

// AngularJS filter is not defined in ReactJS testing mode
// Although we could use Jest mock, it makes sense
// to fallback to identity function by default
const translateFilter = template =>
  $filter ? $filter('translate')(template) : template;

export const translate: Translate = (template, context) => (
  formatTemplate(translateFilter(template), context)
);

const getLocale = state => ({
  locale: state.locale,
  translate,
});

export const withTranslation = connect<TranslateProps>(getLocale);
