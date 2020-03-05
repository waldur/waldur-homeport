import * as React from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentUseLimitForBillingField: React.FC<{}> = () => (
  <FormGroup>
    <Field
      name="use_limit_for_billing"
      component={prop => (
        <AwesomeCheckbox
          id="use_limit_for_billing"
          label={translate(
            'Charge for usage-based component is based on user-requested limit.',
          )}
          {...prop.input}
        />
      )}
    />
  </FormGroup>
);
