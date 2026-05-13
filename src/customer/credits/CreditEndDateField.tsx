import { FC, useMemo } from 'react';
import { Field, useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { FormGroupFinal } from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';

import { getStartOfNextMonth } from './constants';
import { BaseCreditFormData } from './types';

const onlyFirstDayOfMonth = (date: Date) => date.getDate() === 1;

export const CreditEndDateField: FC = () => {
  const { values: formValues } = useFormState<BaseCreditFormData>({
    subscription: { values: true },
  });

  const validate = useMemo(
    () =>
      formValues.minimal_consumption_logic === 'linear' ? required : undefined,
    [formValues.minimal_consumption_logic],
  );

  return (
    <Field
      name="end_date"
      label={translate('End date')}
      description={translate('On that date all credit will be set to 0')}
      required={formValues.minimal_consumption_logic === 'linear'}
      validate={validate}
      component={FormGroupFinal}
    >
      <DateField
        placeholder={translate('Select date...')}
        minDate={
          formValues.minimal_consumption_logic === 'linear'
            ? getStartOfNextMonth().toISO()
            : undefined
        }
        enable={[onlyFirstDayOfMonth]}
      />
    </Field>
  );
};
