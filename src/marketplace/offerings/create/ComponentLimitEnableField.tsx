import * as React from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentLimitEnableField: React.FC<{}> = () => (
  <FormGroup label={translate('Enable limit')}>
    <Field
      component={AwesomeCheckboxField}
      name="limit_amount"
      format={(v) => v !== null}
      parse={(v) => (v ? 0 : null)}
    />
  </FormGroup>
);
