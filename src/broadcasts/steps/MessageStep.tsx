import { DateTime } from 'luxon';
import { FC } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';

import { required } from '@waldur/core/validators';
import { Select } from '@waldur/form/AsyncSelectField';
import { DateField } from '@waldur/form/DateField';
import { StringField } from '@waldur/form/StringField';
import { TextField } from '@waldur/form/TextField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

import { templateAutocomplete } from '../autocomplete';
import { BroadcastFormData, MessageTemplate } from '../types';

export const MessageStep: FC<WizardStepProps> = (props) => {
  const { values: formValues } = useFormState<BroadcastFormData>();
  const form = useForm();

  return (
    <WizardModal {...props}>
      <FormGroup
        label={translate('Template')}
        description={translate('Select a pre-defined template')}
      >
        <Field
          name="template"
          component={Select as any}
          placeholder={translate('Select template...')}
          loadOptions={templateAutocomplete}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.uuid}
          noOptionsMessage={() => translate('No templates found')}
          onChange={(newValue: MessageTemplate) => {
            if (newValue) {
              if (
                formValues &&
                ((formValues.subject &&
                  formValues.subject != newValue.subject) ||
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
      </FormGroup>

      <FormGroup label={translate('Subject')} required>
        <Field
          name="subject"
          component={StringField as any}
          validate={required}
        />
      </FormGroup>

      <FormGroup label={translate('Message')} required>
        <Field name="body" component={TextField as any} validate={required} />
      </FormGroup>

      <FormGroup
        label={translate('Send at')}
        description={translate(
          'Schedule the message to be sent at a specific time',
        )}
      >
        <Field
          name="send_at"
          component={DateField as any}
          minDate={DateTime.now().plus({ days: 1 }).toISO()}
        />
      </FormGroup>
    </WizardModal>
  );
};
