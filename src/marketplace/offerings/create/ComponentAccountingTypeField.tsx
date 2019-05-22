import * as React from 'react';
import Select, { Options, Option } from 'react-select';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { BillingType } from '@waldur/marketplace/types';

interface Props {
  component: string;
  removeOfferingQuotas(): void;
}

export const getAccountingTypeOptions: () => Options<BillingType> = () => [
  {label: translate('Usage-based'), value: 'usage'},
  {label: translate('Fixed price'), value: 'fixed'},
  {label: translate('One-time'), value: 'one'},
  {label: translate('One-time on plan switch'), value: 'few'},
];

export const ComponentAccountingTypeField = (props: Props) => (
  <FormGroup label={translate('Accounting type')} required={true}>
    <Field
      name={`${props.component}.billing_type`}
      validate={required}
      onChange={(_, newOption: Option<BillingType>, prevOption: Option<BillingType>) => {
        if (newOption && prevOption && newOption.value === 'usage' && prevOption.value === 'fixed') {
          props.removeOfferingQuotas();
        }
      }}
      component={fieldProps => (
        <Select
          value={fieldProps.input.value}
          onChange={value => fieldProps.input.onChange(value)}
          options={getAccountingTypeOptions()}
          clearable={false}
        />
      )}
    />
  </FormGroup>
);
