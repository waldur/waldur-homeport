import { FC, useEffect } from 'react';
import { useForm, useFormState } from 'react-final-form';

import { parseDate } from '@/core/dateUtils';

import { ApplyAsMinimalConsumptionField } from './ApplyAsMinimalConsumptionField';
import { getStartOfNextMonth } from './constants';
import { CreditEndDateField } from './CreditEndDateField';
import { ExpectedConsumptionField } from './ExpectedConsumptionField';
import { GraceCoefficientField } from './GraceCoefficientField';
import { MinimalConsumptionLogicField } from './MinimalConsumptionLogicField';
import { BaseCreditFormData } from './types';

export const MinimalConsumptionFields: FC<{
  initialValues?: any;
  filterField?: string;
}> = ({ initialValues, filterField }) => {
  const { values: formValues } = useFormState<BaseCreditFormData>({
    subscription: { values: true },
  });

  const { change } = useForm();

  useEffect(() => {
    if (!initialValues?.minimal_consumption_logic) {
      change('minimal_consumption_logic', 'fixed');
    }
  }, [change, initialValues]);

  useEffect(() => {
    if (formValues.minimal_consumption_logic === 'linear') {
      if (
        formValues.end_date &&
        parseDate(formValues.end_date) < getStartOfNextMonth() &&
        formValues.end_date !== initialValues?.end_date
      ) {
        change('end_date', null);
      }
    }
  }, [
    change,
    formValues.minimal_consumption_logic,
    formValues.end_date,
    initialValues,
  ]);

  if (filterField) {
    switch (filterField) {
      case 'end_date':
        return <CreditEndDateField />;
      case 'minimal_consumption_logic':
        return <MinimalConsumptionLogicField />;
      case 'expected_consumption':
        return <ExpectedConsumptionField />;
      case 'grace_coefficient':
        return <GraceCoefficientField />;
      case 'apply_as_minimal_consumption':
        return <ApplyAsMinimalConsumptionField />;
      default:
        return null;
    }
  }

  return (
    <>
      <CreditEndDateField />
      <MinimalConsumptionLogicField />
      <ExpectedConsumptionField />
      <GraceCoefficientField />
      <ApplyAsMinimalConsumptionField />
    </>
  );
};
