import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import {
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentMaxValueField: React.FC<{}> = () => (
  <FormGroup label={translate('Maximum allowed value')}>
    <Field
      component="input"
      className="form-control"
      name="max_value"
      type="number"
      min={0}
      parse={parseIntField}
      format={formatIntField}
    />
  </FormGroup>
);
