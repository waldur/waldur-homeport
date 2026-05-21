import { FunctionComponent, useMemo } from 'react';
import { useFormState } from 'react-final-form';

import { formatDateTime, parseDate } from '@/core/dateUtils';
import { required } from '@/core/validators';
import { FormContainer, NumberField, SelectField } from '@/form';
import { WizardFormStepProps } from '@/form/WizardForm';
import { WizardForm } from '@/form/WizardForm';
import { translate } from '@/i18n';
import { getRoundReviewStrategyOptions } from '@/proposals/utils';

export const WizardFormSecondPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  const { values, submitting } = useFormState({
    subscription: { values: true, submitting: true },
  });
  const { cutoff_time, review_duration_in_days } = values;
  const latestReviewDate = useMemo(() => {
    if (!cutoff_time || !review_duration_in_days) return null;
    return formatDateTime(
      parseDate(cutoff_time).plus({ days: review_duration_in_days }),
    );
  }, [cutoff_time, review_duration_in_days]);
  return (
    <WizardForm {...props}>
      <FormContainer submitting={submitting}>
        <SelectField
          name="review_strategy"
          label={translate('Review strategy')}
          simpleValue={true}
          options={getRoundReviewStrategyOptions()}
          required={true}
          isClearable={false}
          validate={required}
        />
        <NumberField
          label={translate('Review duration (days)')}
          name="review_duration_in_days"
          required
          validate={required}
        />
        <NumberField
          label={translate('Minimum number of reviewers')}
          name="minimum_number_of_reviewers"
          required
          validate={required}
        />
        {translate('Latest review completion date')}: {latestReviewDate}
      </FormContainer>
    </WizardForm>
  );
};
