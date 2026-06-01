import React, { useEffect, useRef } from 'react';
import { Field, useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import { FormGroup } from '../../FormGroup';

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
> = (props) => {
  const { values } = useFormState({ subscription: { values: true } });
  const prevValueRef = useRef(values?.billing_type);

  useEffect(() => {
    if (
      values?.billing_type?.value === 'usage' &&
      prevValueRef.current?.value === 'fixed' &&
      props.removeOfferingQuotas
    ) {
      props.removeOfferingQuotas();
    }
    prevValueRef.current = values?.billing_type;
  }, [values?.billing_type, props.removeOfferingQuotas]);

  if (props.readOnly) {
    return (
      <FormGroup
        label={translate('Accounting type')}
        controlId="billing_type"
        space={5}
      >
        <Field
          name="billing_type"
          subscription={{ value: true }}
          render={({ input }) => renderFieldOrDash(input.value?.label)}
        />
      </FormGroup>
    );
  }

  return (
    <SelectGroup
      name="billing_type"
      label={translate('Accounting type')}
      required={true}
      validate={required}
      options={getAccountingTypeOptions()}
      isClearable={false}
      isDisabled={props.disabled}
      space={5}
    />
  );
};
