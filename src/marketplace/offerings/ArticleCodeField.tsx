import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { translate } from '@/i18n';

import { FormGroupWithError } from './FormGroupWithError';
import { articleCodeValidator } from './utils';

export const ArticleCodeField: FunctionComponent = () => {
  return (
    <Field
      name="article_code"
      validate={articleCodeValidator}
      label={translate('Article code')}
      description={translate('Technical code used by accounting software.')}
      component={FormGroupWithError}
    />
  );
};
