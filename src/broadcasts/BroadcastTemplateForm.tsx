import { required } from '@/core/validators';
import { FormContainer, StringField, TextField } from '@/form';
import { translate } from '@/i18n';

export const BroadcastTemplateForm = ({
  submitting,
}: {
  submitting: boolean;
}) => {
  return (
    <div className="scroll-y">
      <FormContainer submitting={submitting}>
        <StringField
          name="name"
          label={translate('Name')}
          maxLength={150}
          required={true}
          validate={required}
        />

        <StringField
          name="subject"
          label={translate('Subject')}
          required={true}
          validate={required}
        />

        <TextField
          name="body"
          label={translate('Message')}
          required={true}
          validate={required}
        />
      </FormContainer>
    </div>
  );
};
