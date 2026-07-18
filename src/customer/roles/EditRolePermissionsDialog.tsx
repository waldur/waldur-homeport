import { FORM_ERROR } from 'final-form';
import { FC, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { RoleDetails, RoleModifyRequest, rolesUpdate } from 'waldur-js-client';

import { PermissionField } from '@/administration/roles/PermissionField';
import { getRoles } from '@/administration/roles/utils';
import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import { FormGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

interface EditRolePermissionsDialogResolve {
  row: RoleDetails;
  refetch: () => void;
}

// Focused editor for an organization role: only its permissions can change; the
// name and scope of a clone are fixed (they encode the owning organization).
export const EditRolePermissionsDialog: FC<{
  resolve: EditRolePermissionsDialogResolve;
}> = ({ resolve }) => {
  const { row } = resolve;
  const { closeDialog } = useModal();
  const { showErrorResponse } = useNotify();

  const onSubmit = useCallback(
    async (formData: RoleModifyRequest) => {
      try {
        await rolesUpdate({
          path: { uuid: row.uuid },
          body: {
            name: row.name,
            content_type: row.content_type,
            permissions: formData.permissions,
          },
        });
        ENV.roles = await getRoles();
        closeDialog();
        resolve.refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to save role.'));
        if (e.response && e.response.status === 400) {
          return {
            ...e.response.data,
            [FORM_ERROR]:
              e.response.data?.non_field_errors?.[0] || e.response.data?.detail,
          };
        }
        return { [FORM_ERROR]: translate('Unable to save role.') };
      }
    },
    [row, closeDialog, showErrorResponse, resolve],
  );

  return (
    <Form initialValues={{ permissions: row.permissions }} onSubmit={onSubmit}>
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit permissions of {name}', {
              name: row.description || row.name,
            })}
            footer={
              <>
                <SubmitButton submitting={submitting}>
                  {translate('Save')}
                </SubmitButton>
                <CloseDialogButton />
              </>
            }
          >
            <FormGroup label={translate('Permissions')} required>
              <Field
                component={PermissionField}
                name="permissions"
                validate={required}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
