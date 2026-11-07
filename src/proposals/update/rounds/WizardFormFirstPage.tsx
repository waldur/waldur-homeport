import { FunctionComponent, useMemo } from 'react';
import { useFormState } from 'react-final-form';

import { formatISOWithoutZone, parseDate } from '@/core/dateUtils';
import { required } from '@/core/validators';
import {
  DateTimeGroup,
  NumberGroup,
  SelectGroup,
  TimezoneGroup,
  BooleanGroup,
} from '@/form';
import { translate } from '@/i18n';
import { WizardForm, WizardFormStepProps } from '@/wizard';

const cadenceOptions = [
  { value: 'monthly', label: translate('Monthly') },
  { value: 'quarterly', label: translate('Quarterly') },
  { value: 'biannual', label: translate('Biannual') },
  { value: 'yearly', label: translate('Yearly') },
  { value: 'custom', label: translate('Custom') },
];

interface WizardFormFirstPageProps extends WizardFormStepProps {
  /**
   * Why the call cannot have a round without a cut-off; null when it can.
   * Left out, the form offers no such round.
   */
  openEndedBlockedReason?: string | null;
  /** Whether the form may create several rounds at once. */
  allowRepeats?: boolean;
}

export const WizardFormFirstPage: FunctionComponent<
  WizardFormFirstPageProps
> = ({ openEndedBlockedReason, allowRepeats = true, ...props }) => {
  const { values, submitting } = useFormState({
    subscription: { values: true, submitting: true },
  });
  const {
    cutoff_time,
    start_time,
    repeats,
    submission_window_days,
    cadence,
    open_ended,
  } = values;
  const offersOpenEnded = openEndedBlockedReason !== undefined;

  const duration = useMemo(() => {
    if (!start_time || !cutoff_time) return null;
    const startDate = parseDate(start_time);
    const cutoffDate = parseDate(cutoff_time);
    const diff = cutoffDate.diff(startDate, 'days').toObject().days;
    // How long the round is open, in days: a relative phrase ("in 2
    // months") rounds down and reads as time from now.
    if (diff > 0) {
      const days = Math.round(diff);
      return days === 1
        ? translate('1 day')
        : translate('{count} days', { count: days });
    }
    return null;
  }, [cutoff_time, start_time]);
  return (
    <WizardForm {...props}>
      <div>
        <TimezoneGroup
          name="timezone"
          label={translate('Time zone')}
          required={true}
          isSearchable={true}
          isClearable={false}
          validate={required}
        />
        <DateTimeGroup
          label={translate('Start date')}
          name="start_time"
          required
          validate={required}
          parse={(value) => (value ? formatISOWithoutZone(value) : value)}
          format={(value) => (value ? new Date(value) : value)}
        />
        {offersOpenEnded && !repeats && (
          <BooleanGroup
            name="open_ended"
            label={translate('No cut-off (continuously open)')}
            description={
              openEndedBlockedReason && !open_ended
                ? openEndedBlockedReason
                : translate(
                    'The round takes proposals until a call manager closes it. Each proposal is evaluated as it is submitted.',
                  )
            }
            disabled={Boolean(openEndedBlockedReason) && !open_ended}
          />
        )}
        {allowRepeats && !open_ended && (
          <BooleanGroup
            name="repeats"
            label={translate('Repeats')}
            help={translate('Create multiple rounds at a regular cadence.')}
          />
        )}
        {!repeats && !open_ended && (
          <DateTimeGroup
            label={translate('Cutoff date')}
            name="cutoff_time"
            required
            validate={required}
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
          <NumberGroup
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
            disabled={submitting}
          />
        )}
        {repeats && (
          <SelectGroup
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
            disabled={submitting}
          />
        )}
        {repeats && cadence === 'custom' && (
          <NumberGroup
            label={translate('Custom interval (months)')}
            name="custom_interval_months"
            required
            validate={required}
            min={1}
            disabled={submitting}
          />
        )}
        {repeats && (
          <NumberGroup
            label={translate('Number of rounds')}
            name="number_of_rounds"
            required
            validate={required}
            min={1}
            description={translate(
              'Each round gets a slug based on the call and its start month. You can rename rounds individually after creation.',
            )}
            disabled={submitting}
          />
        )}
      </div>
    </WizardForm>
  );
};
