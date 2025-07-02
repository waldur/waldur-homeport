import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';

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
