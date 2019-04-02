import * as React from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface Props {
  component: string;
}

export const ComponentDisableQuotaField = (props: Props) => (
  <FormGroup>
    <Field
      name={`${props.component}.disable_quotas`}
      component={prop =>
        <AwesomeCheckbox
          id={`${props.component}.disable_quotas`}
          label={translate('Do not allow user to specify quotas when offering is provisioned.')}
          {...prop.input}
        />
      }
    />
  </FormGroup>
);
