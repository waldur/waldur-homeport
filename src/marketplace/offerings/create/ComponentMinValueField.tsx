import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { parseIntField, formatIntField } from '@waldur/marketplace/common/utils';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface Props {
  component: string;
}

export const ComponentMinValueField = (props: Props) => (
  <FormGroup label={translate('Minimum allowed value')}>
    <Field
      component="input"
      className="form-control"
      name={`${props.component}.min_value`}
      type="number"
      min={0}
      parse={parseIntField}
      format={formatIntField}
    />
  </FormGroup>
);
