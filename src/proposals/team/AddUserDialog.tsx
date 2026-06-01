import { UserCirclePlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { RoleDetails } from 'waldur-js-client';

import { post } from '@/core/api';
import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import { usersAutocomplete } from '@/customer/team/utils';
import { SubmitButton, AsyncSelectGroup } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ExpirationTimeGroup } from '@/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@/project/team/RoleGroup';
import { UserListOptionInline } from '@/project/team/UserListOptionInline';

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
  const saveUserMutation = useManagedMutation<any, any, AddUserDialogFormData>({
    mutationFn: (formData) =>
      post(`${scope.url}add_user/`, {
        user: formData.user.uuid,
        expiration_time: formData.expiration_time,
        role: roles && roles.length === 1 ? roles[0] : formData.role.name,
      }),
    successMessage: translate('User has been added.'),
    errorMessage: translate('Unable to add user.'),
    refetch,
  });

  const initialValues =
    roles && roles.length === 1
      ? { role: ENV.roles.find((role) => role.name === roles[0]) }
      : {};

  return (
    <Form<AddUserDialogFormData>
      onSubmit={(values) => saveUserMutation.mutateAsync(values)}
      initialValues={initialValues}
    >
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
              <AsyncSelectGroup
                name="user"
                placeholder={translate('Search and select user...')}
                loadOptions={usersAutocomplete}
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
