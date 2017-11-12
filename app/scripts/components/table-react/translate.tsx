import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { $filter } from '@waldur/core/services';

type Formatter = (template: string, context?: any) => string;

export const formatTemplate: Formatter = (template, context) => (
  context ? template.replace(/{(.+?)}/g, (match, key) => context[key]) : template
);

const translate: Formatter = (template, context) => (
  formatTemplate($filter('translate')(template), context)
);

const getLocale = state => ({
  locale: state.locale
});

const withLocale = connect(getLocale);

// eslint-disable-next-line react/display-name
const withTranslationPure = WrappedComponent => props => (
  <WrappedComponent {...props} translate={translate}/>
);

export const withTranslation = compose(withLocale, withTranslationPure);
