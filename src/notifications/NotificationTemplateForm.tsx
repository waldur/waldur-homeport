import { Modal } from 'react-bootstrap';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const NotificationTemplateForm = ({
  submitting,
}: {
  submitting: boolean;
}) => {
  return (
    <Modal.Body className="scroll-y mx-5 mx-xl-15 my-7">
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
        <div className="mb-5 text-end">
          <SubmitButton
            block={false}
            submitting={submitting}
            label={translate('Save')}
          />
        </div>
      </FormContainer>
    </Modal.Body>
  );
};
