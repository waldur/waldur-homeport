import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import { staffPasskeysRevoke } from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
import { required } from '@/core/validators';
import { TextGroup } from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

interface StaffPasskeyRevokeDialogProps {
  resolve: {
    row: { uuid: string; name: string };
    refetch?: () => void;
  };
}

export const StaffPasskeyRevokeDialog: FunctionComponent<
  StaffPasskeyRevokeDialogProps
> = ({ resolve }) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const submit = async (values: { reason: string }) => {
    try {
      await staffPasskeysRevoke({
        path: { uuid: resolve.row.uuid },
        body: { reason: values.reason },
      });
      showSuccess(translate('Passkey has been revoked.'));
      resolve.refetch?.();
      closeDialog();
    } catch (error) {
      showErrorResponse(error, translate('Unable to revoke passkey.'));
    }
  };

  return (
    <Form
      onSubmit={submit}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Revoke passkey')}
            footer={
              <SubmitButton
                submitting={submitting}
                invalid={invalid}
                variant="danger"
                label={translate('Revoke')}
              />
            }
          >
            <AlertItem
              variant="warning"
              title={translate('This signs the user out of that credential')}
              body={translate(
                'They will not be able to use this passkey again. If it was their only one and passkeys are required for their account, they will be asked to enrol a new one before they can continue.',
              )}
              className="mb-4"
            />
            <TextGroup
              name="reason"
              label={translate('Reason')}
              description={translate(
                'Recorded in the audit log and visible to the account holder.',
              )}
              placeholder={translate('e.g. Laptop reported stolen')}
              validate={required}
              required
              autoFocus
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
