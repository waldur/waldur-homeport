import { FunctionComponent, useMemo } from 'react';
import { Field, useFormState } from 'react-final-form';

import { formatISOWithoutZone, parseDate } from '@/core/dateUtils';
import { required } from '@/core/validators';
import { FormContainer, NumberField, SelectField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { DateTimeField } from '@/form/DateTimeField';
import { TimezoneField } from '@/form/TimezoneField';
import { translate } from '@/i18n';
import { WizardForm, WizardFormStepProps } from '@/wizard';

const cadenceOptions = [
  { value: 'monthly', label: translate('Monthly') },
  { value: 'quarterly', label: translate('Quarterly') },
  { value: 'biannual', label: translate('Biannual') },
  { value: 'yearly', label: translate('Yearly') },
  { value: 'custom', label: translate('Custom') },
];

export const WizardFormFirstPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  const { values, submitting } = useFormState({
    subscription: { values: true, submitting: true },
  });
  const { cutoff_time, start_time, repeats, submission_window_days, cadence } =
    values;

  const duration = useMemo(() => {
    if (!start_time || !cutoff_time) return null;
    const startDate = parseDate(start_time);
    const cutoffDate = parseDate(cutoff_time);
    const diff = cutoffDate.diff(startDate, 'days').toObject().days;
    if (diff > 0) {
      return cutoffDate.toRelative({ base: startDate });
    }
    return null;
  }, [cutoff_time, start_time]);
  return (
    <WizardForm {...props}>
      <FormContainer submitting={submitting}>
        <TimezoneField
          name="timezone"
          label={translate('Time zone')}
          required={true}
          isSearchable={true}
          isClearable={false}
          validate={required}
        />
        <DateTimeField
          label={translate('Start date')}
          name="start_time"
          required
          validate={required}
          dateFormat="Y-m-d H:i"
          parse={(value) => (value ? formatISOWithoutZone(value) : value)}
          format={(value) => (value ? new Date(value) : value)}
        />
        <Field
          name="repeats"
          component={AwesomeCheckboxField}
          label={translate('Repeats')}
          help_text={translate('Create multiple rounds at a regular cadence.')}
          hideLabel
        />
        {!repeats && (
          <DateTimeField
            label={translate('Cutoff date')}
            name="cutoff_time"
            required
            validate={required}
            dateFormat="Y-m-d H:i"
            parse={(value) => (value ? formatISOWithoutZone(value) : value)}
            format={(value) => (value ? new Date(value) : value)}
            description={
              duration
                ? translate('Duration: {duration}', { duration })
                : undefined
            }
          />
        )}
        {repeats && (
          <NumberField
            label={translate('Submission window (days)')}
            name="submission_window_days"
            required
            validate={required}
            min={1}
            description={
              submission_window_days
                ? translate('Each round closes {n} days after its start.', {
                    n: submission_window_days,
                  })
                : undefined
            }
          />
        )}
        {repeats && (
          <SelectField
            name="cadence"
            label={translate('Cadence')}
            simpleValue={true}
            options={cadenceOptions}
            required={true}
            isClearable={false}
            validate={required}
            description={translate(
              'How often a new round starts after the previous one.',
            )}
          />
        )}
        {repeats && cadence === 'custom' && (
          <NumberField
            label={translate('Custom interval (months)')}
            name="custom_interval_months"
            required
            validate={required}
            min={1}
          />
        )}
        {repeats && (
          <NumberField
            label={translate('Number of rounds')}
            name="number_of_rounds"
            required
            validate={required}
            min={1}
            description={translate(
              'Each round gets a slug based on the call and its start month. You can rename rounds individually after creation.',
            )}
          />
        )}
      </FormContainer>
    </WizardForm>
  );
};
