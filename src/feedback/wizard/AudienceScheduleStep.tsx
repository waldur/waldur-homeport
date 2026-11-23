import { FC } from 'react';
import { useField } from 'react-final-form';

import { WizardModal, WizardStepProps } from 'waldur-wizard';

import { AudienceFields } from '@/broadcasts/AudienceFields';
import { required } from '@/core/validators';
import { BooleanGroup, DateTimeGroup, NumberGroup } from '@/form';
import { translate } from '@/i18n';

import {
  getDisabledReason,
  positive,
  validateAudience,
  validateEndsAt,
} from './validation';

const validateCustomers = (_value, values) =>
  validateAudience(values).customers;

export const AudienceScheduleStep: FC<WizardStepProps> = (props) => {
  // A field-level check, not the wizard's validate: that one runs on every
  // step and would block the steps before this one. Registered here so it
  // still runs while "Ask all users" hides the organization picker.
  useField('customers', { validate: validateCustomers, subscription: {} });

  return (
    <WizardModal
      {...props}
      submitTooltip={
        props.invalid ? getDisabledReason(props.errors) : undefined
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <DateTimeGroup
          name="starts_at"
          label={translate('Starts at')}
          required
          validate={required}
        />
        <DateTimeGroup
          name="ends_at"
          label={translate('Ends at')}
          required
          validate={validateEndsAt}
        />
      </div>
      <AudienceFields
        allUsersLabel={translate('Ask all users')}
        hint={translate(
          'With both organizations and offerings selected, only users of those offerings in those organizations are asked.',
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <NumberGroup
          name="max_prompts"
          required
          validate={positive}
          label={translate('Max prompts')}
          description={translate('How many times a user is prompted at most.')}
          min={1}
        />
        <NumberGroup
          name="snooze_days"
          required
          validate={positive}
          label={translate('Snooze days')}
          description={translate(
            'Days the prompt stays hidden after it is shown or postponed.',
          )}
          min={1}
        />
      </div>
      <BooleanGroup
        name="is_active"
        label={translate('Active')}
        hideLabel
        spaceless
      />
    </WizardModal>
  );
};
