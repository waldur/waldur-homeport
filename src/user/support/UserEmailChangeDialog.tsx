import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { User } from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { useEmailChange } from './useEmailChange';

export const UserEmailChangeDialog: FunctionComponent<{
  resolve: { user: User; isProtected };
}> = ({ resolve: { user, isProtected } }) => {
  const { handleSubmit, cancelRequest, submitting, email, setEmail } =
    useEmailChange(user);

  return (
    <ModalDialog
      title={translate('Email')}
      subtitle={translate(
        'Provide an email address for communication and recovery',
      )}
      footer={
        <>
          <CloseDialogButton
            variant="outline btn-outline-default"
            className="flex-equal"
          />

          {!user.requested_email ? (
            <SubmitButton
              disabled={email === user.email || !email || isProtected}
              submitting={submitting}
              label={translate('Request change')}
              className="btn btn-primary flex-equal"
              onClick={handleSubmit}
            />
          ) : (
            <SubmitButton
              disabled={isProtected}
              submitting={submitting}
              label={translate('Cancel request')}
              className="btn btn-light-danger flex-equal"
              onClick={cancelRequest}
            />
          )}
        </>
      }
    >
      {user.requested_email ? (
        <>
          <Form.Control
            readOnly
            defaultValue={user.requested_email}
            className="form-control-solid"
          />

          <Form.Text muted>{translate('Request has been sent')}</Form.Text>
        </>
      ) : (
        <Form.Control
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      )}
      {isProtected && (
        <Form.Text muted>
          {translate('Synchronized from identity provider')}
        </Form.Text>
      )}
    </ModalDialog>
  );
};
