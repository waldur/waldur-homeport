import { UserCirclePlusIcon } from '@phosphor-icons/react';
import { reduxForm } from 'redux-form';
import { RoleDetails } from 'waldur-js-client';

import { post } from '@waldur/core/api';
import { required } from '@waldur/core/validators';
import { usersAutocomplete } from '@waldur/customer/team/utils';
import { FormContainer, SubmitButton } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ExpirationTimeGroup } from '@waldur/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@waldur/project/team/RoleGroup';
import { UserListOptionInline } from '@waldur/project/team/UserListOptionInline';
import { useNotify } from '@waldur/store/hooks';

import { AddUserDialogProps } from './types';

const FORM_ID = 'AddUserDialog';

interface AddUserDialogFormData {
  role: RoleDetails;
  expiration_time: string;
  user: any;
}

export const AddUserDialog = reduxForm<
  AddUserDialogFormData,
  AddUserDialogProps
>({
  form: FORM_ID,
})(({
  submitting,
  handleSubmit,
  refetch,
  invalid,
  scope,
  roleTypes,
  roles,
}) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const getOptionLabel = (option) =>
    option.email
      ? (option.full_name || option.username) + ` (${option.email})`
      : option.full_name || option.username;

  const saveUser = async (formData: AddUserDialogFormData) => {
    try {
      await post(`${scope.url}add_user/`, {
        user: formData.user.uuid,
        expiration_time: formData.expiration_time,
        role: roles && roles.length === 1 ? roles[0] : formData.role.name,
      });

      await refetch();
      showSuccess('User has been added.');
      closeDialog();
    } catch (error) {
      showErrorResponse(error, translate('Unable to add user.'));
    }
  };

  return (
    <form onSubmit={handleSubmit(saveUser)}>
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
        <FormContainer submitting={submitting}>
          <AsyncSelectField
            name="user"
            label={translate('User')}
            placeholder={translate('Search and select user...')}
            loadOptions={(query, prevOptions, page) =>
              usersAutocomplete({ query }, prevOptions, page)
            }
            getOptionValue={(option) => option.uuid}
            getOptionLabel={getOptionLabel}
            components={{ Option: UserListOptionInline }}
            required={true}
            validate={[required]}
          />

          {roles && roles.length === 1 ? null : <RoleGroup types={roleTypes} />}
          <ExpirationTimeGroup />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
