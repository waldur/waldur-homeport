import { FC } from 'react';
import { Form } from 'react-final-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { RoleForm } from './RoleForm';

interface RoleFormDialogProps {
  submitFn(payload): void;
  resolve?: { row? };
}

export const RoleFormDialog: FC<RoleFormDialogProps> = (props) => {
  const role = props.resolve?.row;

  return (
    <Form
      onSubmit={props.submitFn}
      initialValues={role}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={role ? translate('Edit role') : translate('New role')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            <RoleForm role={role} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
