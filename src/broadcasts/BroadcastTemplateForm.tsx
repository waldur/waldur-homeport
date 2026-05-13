import { FC } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { FormGroupFinal, StringField, TextField } from '@/form';
import { translate } from '@/i18n';

export const BroadcastTemplateForm: FC = () => {
  return (
    <div className="scroll-y">
      <Field
        name="name"
        label={translate('Name')}
        component={FormGroupFinal}
        required={true}
        validate={required}
      >
        <StringField maxLength={150} />
      </Field>

      <Field
        name="subject"
        label={translate('Subject')}
        component={FormGroupFinal}
        required={true}
        validate={required}
      >
        <StringField />
      </Field>

      <Field
        name="body"
        label={translate('Message')}
        component={FormGroupFinal}
        required={true}
        validate={required}
      >
        <TextField />
      </Field>
    </div>
  );
};
