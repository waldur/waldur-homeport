import { FunctionComponent } from 'react';
import { User } from 'waldur-js-client';

import { FormText } from 'waldur-ui';

import { SubmitButton } from '@/form';
import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { useEmailChange } from './useEmailChange';

export const UserEmailChangeDialog: FunctionComponent<{
  resolve: { user: User; isProtected };
}> = ({ resolve: { user, isProtected } }) => {
  const { handleSubmit, cancelRequest, submitting, email, setEmail } =
    useEmailChange(user);

  return (
    <ModalDialog
      title={translate('Email')}
      subtitle={translate('Provide an email address for notifications')}
      footer={
        <>
          <CloseDialogButton variant="tertiary" className="flex-equal" />

          {!user.requested_email ? (
            <SubmitButton
              disabled={email === user.email || !email || isProtected}
              submitting={submitting}
              label={translate('Request change')}
              variant="primary"
              className="flex-equal"
              onClick={() => handleSubmit()}
            />
          ) : (
            <SubmitButton
              disabled={isProtected}
              submitting={submitting}
              label={translate('Cancel request')}
              variant="danger"
              className="flex-equal"
              onClick={() => cancelRequest()}
            />
          )}
        </>
      }
    >
      {user.requested_email ? (
        <>
          <BaseInputField readOnly defaultValue={user.requested_email} solid />

          <FormText variant="muted">
            {translate('Request has been sent')}
          </FormText>
        </>
      ) : (
        <BaseInputField
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      )}
      {isProtected && (
        <FormText variant="muted">
          {translate('Synchronized from identity provider')}
        </FormText>
      )}
    </ModalDialog>
  );
};
