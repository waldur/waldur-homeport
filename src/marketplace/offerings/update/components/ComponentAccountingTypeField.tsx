import React from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

interface ComponentAccountingTypeFieldProps {
  removeOfferingQuotas?(): void;
  disabled?: boolean;
  readOnly?: boolean;
}

export const getAccountingTypeOptions = () => [
  { label: translate('Usage-based'), value: 'usage' },
  { label: translate('Limit-based'), value: 'limit' },
  { label: translate('Fixed price'), value: 'fixed' },
  { label: translate('One-time'), value: 'one' },
  { label: translate('One-time on plan switch'), value: 'few' },
];

export const ComponentAccountingTypeField: React.FC<
  ComponentAccountingTypeFieldProps
> = (props) => (
  <FormGroup
    label={translate('Accounting type')}
    controlId="billing_type"
    required={true}
    space={5}
  >
    <Field
      name="billing_type"
      validate={required}
      onChange={(_, newOption, prevOption) => {
        if (
          newOption &&
          prevOption &&
          newOption.value === 'usage' &&
          prevOption.value === 'fixed' &&
          props.removeOfferingQuotas
        ) {
          props.removeOfferingQuotas();
        }
      }}
      component={(fieldProps) =>
        props.readOnly ? (
          fieldProps.input.value.label
        ) : (
          <Select
            inputId="billing_type"
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            options={getAccountingTypeOptions()}
            isClearable={false}
            isDisabled={props.disabled}
          />
        )
      }
    />
  </FormGroup>
);
