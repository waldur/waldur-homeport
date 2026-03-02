import { UserCirclePlusIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Form } from 'react-final-form';
import { RoleDetails } from 'waldur-js-client';

import { post } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { required } from '@waldur/core/validators';
import { usersAutocomplete } from '@waldur/customer/team/utils';
import { SubmitButton } from '@waldur/form';
import { AsyncSelectFieldFinal } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ExpirationTimeGroup } from '@waldur/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@waldur/project/team/RoleGroup';
import { UserListOptionInline } from '@waldur/project/team/UserListOptionInline';
import { useNotify } from '@waldur/store/hooks';

import { AddUserDialogProps } from './types';

interface AddUserDialogFormData {
  role: RoleDetails;
  expiration_time: string;
  user: any;
}

const getOptionLabel = (option) =>
  option.email
    ? (option.full_name || option.username) + ` (${option.email})`
    : option.full_name || option.username;

export const AddUserDialog: FC<AddUserDialogProps> = ({
  refetch,
  scope,
  roleTypes,
  roles,
}) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const saveUser = useCallback(
    async (formData: AddUserDialogFormData) => {
      try {
        await post(`${scope.url}add_user/`, {
          user: formData.user.uuid,
          expiration_time: formData.expiration_time,
          role: roles && roles.length === 1 ? roles[0] : formData.role.name,
        });

        await refetch();
        showSuccess(translate('User has been added.'));
        closeDialog();
      } catch (error) {
        showErrorResponse(error, translate('Unable to add user.'));
      }
    },
    [scope, roles, refetch, showSuccess, closeDialog, showErrorResponse],
  );

  const initialValues =
    roles && roles.length === 1
      ? { role: ENV.roles.find((role) => role.name === roles[0]) }
      : {};

  return (
    <Form onSubmit={saveUser} initialValues={initialValues}>
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add member')}
            subtitle={translate(
              'Select a user to assign a role within the project.',
            )}
            iconNode={<UserCirclePlusIcon weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  label={translate('Add role')}
                  submitting={submitting}
                  disabled={invalid}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <FormGroup label={translate('User')} required>
              <AsyncSelectFieldFinal
                name="user"
                placeholder={translate('Search and select user...')}
                loadOptions={(query, prevOptions, page) =>
                  usersAutocomplete({ query }, prevOptions, page)
                }
                getOptionValue={(option) => option.uuid}
                getOptionLabel={getOptionLabel}
                components={{ Option: UserListOptionInline }}
                validate={required}
              />
            </FormGroup>

            {roles && roles.length === 1 ? null : (
              <RoleGroup types={roleTypes} />
            )}
            <ExpirationTimeGroup />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
