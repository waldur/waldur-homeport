import { FC } from 'react';
import { Form } from 'react-final-form';
import { CustomerUser, Project, projectsAddUser } from 'waldur-js-client';

import { FormContainerFinal, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Role } from '@/permissions/types';
import { ExpirationTimeGroup } from '@/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@/project/team/RoleGroup';

import { OrganizationProjectSelectField } from './OrganizationProjectSelectField';
import { UserGroup } from './UserGroup';

interface AddProjectUserDialogFormData {
  role: Role;
  expiration_time: string;
  project: Project;
}

interface AddProjectUserDialogResolve {
  customer: CustomerUser;
  refetch;
}

interface AddProjectUserDialogProps {
  resolve: AddProjectUserDialogResolve;
}

export const AddProjectUserDialog: FC<AddProjectUserDialogProps> = ({
  resolve,
}) => {
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
    <Form<AddProjectUserDialogFormData>
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add project role')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={updateMutation.isPending}
                  disabled={invalid}
                  data-testid="submit-button"
                >
                  {translate('Save')}
                </SubmitButton>
              </>
            }
          >
            <FormContainerFinal submitting={updateMutation.isPending}>
              <UserGroup permission={resolve.customer} />
              <OrganizationProjectSelectField />
              <RoleGroup types={['project']} />
              <ExpirationTimeGroup disabled={updateMutation.isPending} />
            </FormContainerFinal>
          </ModalDialog>
        </form>
      )}
    />
  );
};
