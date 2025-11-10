import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { CustomerUser, Project, projectsAddUser } from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { FormContainer } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Role } from '@waldur/permissions/types';
import { ExpirationTimeGroup } from '@waldur/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@waldur/project/team/RoleGroup';
import { showErrorResponse } from '@waldur/store/notify';

import { OrganizationProjectSelectField } from './OrganizationProjectSelectField';
import { UserGroup } from './UserGroup';

const FORM_ID = 'AddProjectUserDialog';

interface AddProjectUserDialogFormData {
  role: Role;
  expiration_time: string;
  project: Project;
}

interface AddProjectUserDialogResolve {
  customer: CustomerUser;
  refetch;
}

interface AddProjectUserDialogOwnProps {
  resolve: AddProjectUserDialogResolve;
}

export const AddProjectUserDialog = reduxForm<
  AddProjectUserDialogFormData,
  AddProjectUserDialogOwnProps
>({
  form: FORM_ID,
})(({ submitting, handleSubmit, resolve }) => {
  const dispatch = useDispatch();

  return (
    <form
      onSubmit={handleSubmit(async (formData) => {
        try {
          await projectsAddUser({
            path: { uuid: formData.project.uuid },
            body: {
              user: resolve.customer.uuid,
              role: formData.role.name,
              expiration_time: formData.expiration_time,
            },
          });
          await resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update permission.')),
          );
        }
      })}
    >
      <ModalDialog
        title={translate('Add project role')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton submitting={submitting}>
              {translate('Save')}
            </SubmitButton>
          </>
        }
      >
        <FormContainer submitting={submitting}>
          <UserGroup permission={resolve.customer} />
          <OrganizationProjectSelectField legacyField />
          <RoleGroup types={['project']} />
          <ExpirationTimeGroup disabled={submitting} />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
