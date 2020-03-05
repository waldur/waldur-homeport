import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import {
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentMinValueField: React.FC<{}> = () => (
  <FormGroup label={translate('Minimum allowed value')}>
    <Field
      component="input"
      className="form-control"
      name="min_value"
      type="number"
      min={0}
      parse={parseIntField}
      format={formatIntField}
    />
  </FormGroup>
);
