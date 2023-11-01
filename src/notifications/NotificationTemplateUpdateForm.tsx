import { Modal } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { NOTIFICATION_TEMPLATE_CREATE_FORM_ID } from '@waldur/notifications/constants';
import { NotificationTemplateFormData } from '@waldur/notifications/types';

interface OwnProps {
  submitting: boolean;
  formValues: NotificationTemplateFormData;
  initialValues?: any;
}

const enhance = reduxForm<NotificationTemplateFormData, OwnProps>({
  form: NOTIFICATION_TEMPLATE_CREATE_FORM_ID,
});

export const NotificationTemplateUpdateForm = enhance(({ submitting }) => (
  <>
    <form>
      <Modal.Header closeButton className="without-border">
        <h2 className="fw-bolder">
          {translate('Create a broadcast template')}
        </h2>
      </Modal.Header>
      <Modal.Body className="scroll-y mx-5 mx-xl-15 my-7">
        <FormContainer submitting={submitting} clearOnUnmount={false}>
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
      </Modal.Body>
    </form>
  </>
));
