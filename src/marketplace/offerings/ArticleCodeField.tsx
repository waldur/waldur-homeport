import * as React from 'react';
import { Field } from 'redux-form';

import { latinName } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';

import { FormGroup } from './FormGroup';

export const ArticleCodeField = props => (
  <FormGroup
    label={translate('Article code')}
    description={translate('Technical code used by accounting software.')}>
    <Field
      component="input"
      className="form-control"
      name={props.name}
      type="text"
      validate={latinName}
    />
  </FormGroup>
);
