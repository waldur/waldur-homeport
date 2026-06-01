import { DateTime } from 'luxon';
import { FC } from 'react';
import { useForm, useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { AsyncSelectGroup, DateGroup, StringGroup, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { WizardModal, WizardStepProps } from '@/wizard';

import { templateAutocomplete } from '../autocomplete';
import { BroadcastFormData, MessageTemplate } from '../types';

export const MessageStep: FC<WizardStepProps> = (props) => {
  const { values: formValues } = useFormState<BroadcastFormData>();
  const form = useForm();

  return (
    <WizardModal {...props}>
      <AsyncSelectGroup
        label={translate('Template')}
        description={translate('Select a pre-defined template')}
        name="template"
        placeholder={translate('Select template...')}
        loadOptions={templateAutocomplete}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.uuid}
        noOptionsMessage={() => translate('No templates found')}
        onChange={(newValue: MessageTemplate) => {
          if (newValue) {
            if (
              formValues &&
              ((formValues.subject && formValues.subject != newValue.subject) ||
                (formValues.body && formValues.body != newValue.body))
            ) {
              const response = confirm(
                'Form is not empty. Selecting template would replace existing message. Are you sure?',
              );
              if (!response) {
                return;
              }
            }
            form.change('subject', newValue.subject);
            form.change('body', newValue.body);
          }
        }}
        isClearable={true}
      />
      <StringGroup
        name="subject"
        validate={required}
        label={translate('Subject')}
        required
      />
      <TextGroup
        name="body"
        validate={required}
        label={translate('Message')}
        required
      />
      <DateGroup
        name="send_at"
        minDate={DateTime.now().plus({ days: 1 }).toISO()}
        label={translate('Send at')}
        description={translate(
          'Schedule the message to be sent at a specific time',
        )}
      />
    </WizardModal>
  );
};
