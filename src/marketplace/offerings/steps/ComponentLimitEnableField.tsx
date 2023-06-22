import React from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentLimitEnableField: React.FC = () => (
  <FormGroup>
    <Field
      component={AwesomeCheckboxField}
      label={translate('Enable limit')}
      name="limit_amount"
      format={(v) => v !== null && typeof v != 'undefined'}
      parse={(v) => (v ? 0 : null)}
    />
  </FormGroup>
);
