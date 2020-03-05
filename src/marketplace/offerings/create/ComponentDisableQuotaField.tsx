import * as React from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentDisableQuotaField: React.FC<{}> = () => (
  <FormGroup>
    <Field
      name="disable_quotas"
      component={prop => (
        <AwesomeCheckbox
          id="disable_quotas"
          label={translate(
            'Do not allow user to specify quotas when offering is provisioned.',
          )}
          {...prop.input}
        />
      )}
    />
  </FormGroup>
);
