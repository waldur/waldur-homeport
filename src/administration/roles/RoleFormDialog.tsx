import { FORM_ERROR } from 'final-form';
import { FC, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { rolesCreate, rolesUpdate, RoleModifyRequest } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import { SubmitButton, StringGroup, SelectGroup } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

import { ROLE_TYPES } from '../../permissions/constants';

import { PermissionField } from './PermissionField';
import { getRoles } from './utils';

interface RoleFormDialogProps {
  resolve: {
    row?;
    refetch(): void;
  };
}

const RoleForm: FC<{ role? }> = (props) => {
  return (
    <>
      <StringGroup
        name="name"
        validate={required}
        disabled={props.role?.is_system_role}
        label={translate('Name')}
        required
      />
      <SelectGroup
        name="content_type"
        validate={required}
        isDisabled={props.role?.is_system_role}
        options={ROLE_TYPES}
        simpleValue
        label={translate('Type')}
        required
      />
      <FormGroup label={translate('Permissions')} required>
        <Field
          component={PermissionField}
          name="permissions"
          validate={required}
        />
      </FormGroup>
    </>
  );
};

export const RoleFormDialog: FC<RoleFormDialogProps> = (props) => {
  const role = props.resolve.row;
  const { closeDialog } = useModal();
  const { showErrorResponse } = useNotify();

  const onSubmit = useCallback(
    async (formData: RoleModifyRequest) => {
      try {
        if (role) {
          await rolesUpdate({ path: { uuid: role.uuid }, body: formData });
        } else {
          await rolesCreate({ body: formData });
        }
        ENV.roles = await getRoles();
        closeDialog();
        props.resolve.refetch();
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
    [role, closeDialog, showErrorResponse, props.resolve],
  );

  return (
    <Form
      onSubmit={onSubmit}
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
