import * as React from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentDisableQuotaField: React.FC<{}> = () => (
  <FormGroup>
    <Field
      name="disable_quotas"
      component={AwesomeCheckboxField}
      label={translate(
        'Do not allow user to specify quotas when offering is provisioned.',
      )}
    />
  </FormGroup>
);
