import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { $filter } from '@waldur/core/services';
import { Translate } from './types';

export const formatTemplate: Translate = (template, context) => (
  context ? template.replace(/{(.+?)}/g, (match, key) => context[key]) : template
);

export const translate: Translate = (template, context) => (
  formatTemplate($filter('translate')(template), context) || template
);

const getLocale = (state) => ({
  locale: state.locale,
});

const withLocale = connect(getLocale);

// eslint-disable-next-line react/display-name
const withTranslationPure = WrappedComponent => props => (
  <WrappedComponent {...props} translate={translate}/>
);

export const withTranslation = compose(withLocale, withTranslationPure);
