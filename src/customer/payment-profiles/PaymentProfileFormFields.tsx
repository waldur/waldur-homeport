import { FC } from 'react';
import { Field, useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import {
  FormGroup,
  NumberField,
  SelectField,
  StringField,
  TextField,
} from '@/form';
import { DateField } from '@/form/DateField';
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
      <Field
        name="name"
        label={translate('Name')}
        component={FormGroup}
        required={true}
        validate={required}
      >
        <StringField maxLength={150} />
      </Field>

      <Field
        name="payment_type"
        label={translate('Type')}
        component={FormGroup}
        required={true}
        validate={required}
      >
        <SelectField options={paymentProfileTypeOptions} isClearable={false} />
      </Field>

      {isFixedPrice && (
        <>
          <Field
            name="end_date"
            label={translate('End date')}
            component={FormGroup}
          >
            <DateField />
          </Field>

          <Field
            name="agreement_number"
            label={translate('Agreement number')}
            component={FormGroup}
          >
            <TextField maxLength={150} />
          </Field>

          <Field
            name="contract_sum"
            label={translate('Contract sum')}
            component={FormGroup}
          >
            <NumberField />
          </Field>
        </>
      )}
    </>
  );
};
