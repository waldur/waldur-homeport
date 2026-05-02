import { reduxForm } from 'redux-form';
import { CustomerUser, Project, projectsAddUser } from 'waldur-js-client';

import { FormContainer, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Role } from '@/permissions/types';
import { ExpirationTimeGroup } from '@/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@/project/team/RoleGroup';

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
})(({ handleSubmit, resolve }) => {
  const updateMutation = useManagedMutation<
    any,
    any,
    AddProjectUserDialogFormData
  >({
    mutationFn: (formData) =>
      projectsAddUser({
        path: { uuid: formData.project.uuid },
        body: {
          user: resolve.customer.uuid,
          role: formData.role.name,
          expiration_time: formData.expiration_time,
        },
      }),
    errorMessage: translate('Unable to update permission.'),
    refetch: resolve.refetch,
  });

  return (
    <form
      onSubmit={handleSubmit((values) => updateMutation.mutateAsync(values))}
    >
      <ModalDialog
        title={translate('Add project role')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton submitting={updateMutation.isPending}>
              {translate('Save')}
            </SubmitButton>
          </>
        }
      >
        <FormContainer submitting={updateMutation.isPending}>
          <UserGroup permission={resolve.customer} />
          <OrganizationProjectSelectField legacyField />
          <RoleGroup types={['project']} legacyField />
          <ExpirationTimeGroup
            disabled={updateMutation.isPending}
            legacyField
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
