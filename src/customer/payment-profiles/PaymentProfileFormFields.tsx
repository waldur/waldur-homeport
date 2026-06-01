import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import {
  DateGroup,
  NumberGroup,
  SelectGroup,
  StringGroup,
  TextGroup,
} from '@/form';
import { translate } from '@/i18n';

interface PaymentProfileFormFieldsProps {
  paymentProfileTypeOptions: any[];
}

export const PaymentProfileFormFields: FC<PaymentProfileFormFieldsProps> = ({
  paymentProfileTypeOptions,
}) => {
  const { values } = useFormState({ subscription: { values: true } });
  const isFixedPrice = values.payment_type?.value === 'fixed_price';

  return (
    <>
      <StringGroup
        name="name"
        label={translate('Name')}
        required={true}
        validate={required}
        maxLength={150}
      />
      <SelectGroup
        name="payment_type"
        label={translate('Type')}
        required={true}
        validate={required}
        options={paymentProfileTypeOptions}
        isClearable={false}
      />
      {isFixedPrice && (
        <>
          <DateGroup name="end_date" label={translate('End date')} />

          <TextGroup
            name="agreement_number"
            label={translate('Agreement number')}
            maxLength={150}
          />

          <NumberGroup name="contract_sum" label={translate('Contract sum')} />
        </>
      )}
    </>
  );
};
