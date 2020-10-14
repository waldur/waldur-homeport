import * as React from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentUseLimitForBillingField: React.FC<{}> = () => (
  <FormGroup>
    <Field
      name="use_limit_for_billing"
      component={AwesomeCheckboxField}
      label={translate(
        'Charge for usage-based component is based on user-requested limit.',
      )}
    />
  </FormGroup>
);
