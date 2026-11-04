import { FC, useMemo } from 'react';
import { useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { DateGroup } from '@/form';
import { translate } from '@/i18n';

import { getStartOfNextMonth } from './constants';
import { BaseCreditFormData } from './types';

const onlyFirstDayOfMonth = (date: Date) => date.getDate() === 1;

/**
 * A project credit is set to 0 on its end date. An organization credit loses
 * only its granted credit: prepayments and earnings do not expire.
 */
export const CreditEndDateField: FC<{ isOrganizationCredit?: boolean }> = ({
  isOrganizationCredit,
}) => {
  const { values: formValues } = useFormState<BaseCreditFormData>({
    subscription: { values: true },
  });

  const validate = useMemo(
    () =>
      formValues.minimal_consumption_logic === 'linear' ? required : undefined,
    [formValues.minimal_consumption_logic],
  );

  return (
    <DateGroup
      name="end_date"
      label={translate('End date')}
      description={
        isOrganizationCredit
          ? translate(
              'On that date the granted credit left will be set to 0. Paid credit and the withdrawable balance do not expire.',
            )
          : translate('On that date all credit will be set to 0')
      }
      required={formValues.minimal_consumption_logic === 'linear'}
      validate={validate}
      placeholder={translate('Select date...')}
      minDate={
        formValues.minimal_consumption_logic === 'linear'
          ? getStartOfNextMonth().toISO()
          : undefined
      }
      enable={[onlyFirstDayOfMonth]}
    />
  );
};
