import { FunctionComponent, useMemo } from 'react';

import { formatDateTime, parseDate } from '@waldur/core/dateUtils';
import { required } from '@waldur/core/validators';
import { FormContainer, NumberField, SelectField } from '@waldur/form';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { getCallReviewStrategyOptions } from '@waldur/proposals/utils';

export const WizardFormSecondPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const { cutoff_time, review_duration_in_days } = wizardProps.formValues;
        const latestReviewDate = useMemo(() => {
          if (!cutoff_time || !review_duration_in_days) return null;
          return formatDateTime(
            parseDate(cutoff_time).plus({ days: review_duration_in_days }),
          );
        }, [cutoff_time, review_duration_in_days]);

        return (
          <FormContainer
            submitting={wizardProps.submitting}
            clearOnUnmount={false}
          >
            <SelectField
              name="review_strategy"
              label={translate('Review strategy')}
              simpleValue={true}
              options={getCallReviewStrategyOptions()}
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
        );
      }}
    </WizardForm>
  );
};
