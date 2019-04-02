import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface Props {
  component: string;
  removeOfferingQuotas(): void;
}

export const ComponentAccountingTypeField = (props: Props) => (
  <FormGroup label={translate('Accounting type')} required={true}>
    <Field
      name={`${props.component}.billing_type`}
      validate={required}
      onChange={(_, newOption, prevOption) => {
        if (newOption && prevOption && newOption.value === 'usage' && prevOption.value === 'fixed') {
          props.removeOfferingQuotas();
        }
      }}
      component={fieldProps => (
        <Select
          value={fieldProps.input.value}
          onChange={value => fieldProps.input.onChange(value)}
          options={[
            {label: translate('Usage-based'), value: 'usage'},
            {label: translate('Fixed price'), value: 'fixed'},
          ]}
          clearable={false}
        />
      )}
    />
  </FormGroup>
);
