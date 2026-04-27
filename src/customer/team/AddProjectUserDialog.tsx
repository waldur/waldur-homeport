import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { CustomerUser, Project, projectsAddUser } from 'waldur-js-client';

import { FormContainer, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { Role } from '@/permissions/types';
import { ExpirationTimeGroup } from '@/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@/project/team/RoleGroup';
import { showErrorResponse } from '@/store/notify';

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
          <RoleGroup types={['project']} legacyField />
          <ExpirationTimeGroup disabled={submitting} legacyField />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
