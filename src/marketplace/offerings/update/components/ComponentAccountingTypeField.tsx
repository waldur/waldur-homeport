import React, { useEffect, useRef } from 'react';
import { Field, useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { getBillingTypes } from '@/marketplace/common/billingTypes';
import { renderFieldOrDash } from '@/table/utils';

import { formatOptionWithDescription } from '../formatOptionWithDescription';

interface ComponentAccountingTypeFieldProps {
  removeOfferingQuotas?(): void;
  disabled?: boolean;
  readOnly?: boolean;
}

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
      options={getBillingTypes()}
      formatOptionLabel={formatOptionWithDescription}
      isClearable={false}
      isDisabled={props.disabled}
      space={5}
    />
  );
};
