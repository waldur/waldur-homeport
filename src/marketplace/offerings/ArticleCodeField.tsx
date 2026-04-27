import { FunctionComponent } from 'react';
import { Field as FinalField } from 'react-final-form';
import { Field } from 'redux-form';

import { translate } from '@/i18n';

import { FormGroupWithError } from './FormGroupWithError';
import { articleCodeValidator } from './utils';

export const ArticleCodeField: FunctionComponent<{ legacyField?: boolean }> = ({
  legacyField,
}) => {
  const Component = (legacyField ? Field : FinalField) as any;
  return (
    <Component
      name="article_code"
      validate={articleCodeValidator}
      label={translate('Article code')}
      description={translate('Technical code used by accounting software.')}
      component={FormGroupWithError}
    />
  );
};
