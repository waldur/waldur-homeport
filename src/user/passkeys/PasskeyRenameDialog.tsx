import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import { passkeysPartialUpdate } from 'waldur-js-client';

import { required } from '@/core/validators';
import { StringGroup } from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

interface PasskeyRenameDialogProps {
  resolve: {
    row: { uuid: string; name: string };
    refetch?: () => void;
  };
}

export const PasskeyRenameDialog: FunctionComponent<
  PasskeyRenameDialogProps
> = ({ resolve }) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const submit = async (values: { name: string }) => {
    try {
      await passkeysPartialUpdate({
        path: { uuid: resolve.row.uuid },
        body: { name: values.name },
      });
      showSuccess(translate('Passkey has been renamed.'));
      resolve.refetch?.();
      closeDialog();
    } catch (error) {
      showErrorResponse(error, translate('Unable to rename passkey.'));
    }
  };

  return (
    <Form
      onSubmit={submit}
      initialValues={{ name: resolve.row.name }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Rename passkey')}
            footer={
              <SubmitButton
                submitting={submitting}
                invalid={invalid}
                label={translate('Save')}
              />
            }
          >
            <StringGroup
              name="name"
              label={translate('Name')}
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
