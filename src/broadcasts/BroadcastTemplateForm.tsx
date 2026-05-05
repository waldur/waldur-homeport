import { FC } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { FormGroup, StringField, TextField } from '@/form';
import { translate } from '@/i18n';

export const BroadcastTemplateForm: FC = () => {
  return (
    <div className="scroll-y">
      <Field
        name="name"
        label={translate('Name')}
        component={FormGroup as any}
        required={true}
        validate={required}
      >
        <StringField maxLength={150} />
      </Field>

      <Field
        name="subject"
        label={translate('Subject')}
        component={FormGroup as any}
        required={true}
        validate={required}
      >
        <StringField />
      </Field>

      <Field
        name="body"
        label={translate('Message')}
        component={FormGroup as any}
        required={true}
        validate={required}
      >
        <TextField />
      </Field>
    </div>
  );
};
