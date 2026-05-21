import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  type CustomerUser,
  type NestedProjectPermission,
  projectsAddUser,
  projectsDeleteUser,
  projectsUpdateUser,
} from 'waldur-js-client';

import { FormContainer, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { type Role } from '@/permissions/types';
import { getProjectRoles } from '@/permissions/utils';
import { ExpirationTimeGroup } from '@/project/team/ExpirationTimeGroup';
import { RoleGroup } from '@/project/team/RoleGroup';

import { ProjectGroup } from './ProjectGroup';
import { UserGroup } from './UserGroup';

interface EditProjectUserDialogFormData {
  role: Role;
  expiration_time: string;
}

interface EditProjectUserDialogResolve {
  project: NestedProjectPermission;
  customer: CustomerUser;
  refetch;
}

interface EditProjectUserDialogProps {
  resolve: EditProjectUserDialogResolve;
}

const savePermissions = async (
  formData: EditProjectUserDialogFormData,
  resolve: EditProjectUserDialogResolve,
) => {
  if (resolve.project.role_name === formData.role.name) {
    await projectsUpdateUser({
      path: { uuid: resolve.project['project_uuid'] },
      body: {
        user: resolve.customer.uuid,
        role: formData.role.name,
        expiration_time: formData.expiration_time,
      },
    });
  } else {
    await projectsDeleteUser({
      path: { uuid: resolve.project['project_uuid'] },
      body: {
        user: resolve.customer.uuid,
        role: resolve.project.role_name,
      },
    });
    await projectsAddUser({
      path: { uuid: resolve.project['project_uuid'] },
      body: {
        user: resolve.customer.uuid,
        role: formData.role.name,
        expiration_time: formData.expiration_time,
      },
    });
  }
  await resolve.refetch();
};

export const EditProjectUserDialog: FC<EditProjectUserDialogProps> = ({
  resolve,
}) => {
  const saveMutation = useManagedMutation<
    any,
    any,
    EditProjectUserDialogFormData
  >({
    mutationFn: (formData) => savePermissions(formData, resolve),
    errorMessage: translate('Unable to update permission.'),
  });

  const initialValues = useMemo(
    () => ({
      role: getProjectRoles().find(
        ({ name }) => name === resolve.project.role_name,
      ),
      expiration_time: resolve.project.expiration_time,
    }),
    [resolve.project],
  );

  return (
    <Form<EditProjectUserDialogFormData>
      onSubmit={(values) => saveMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, invalid, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit project member')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={saveMutation.isPending}
                  disabled={invalid}
                >
                  {translate('Save')}
                </SubmitButton>
              </>
            }
          >
            <FormContainer submitting={saveMutation.isPending}>
              <UserGroup permission={resolve.customer} />
              <ProjectGroup project={resolve.project} />
              <RoleGroup types={['project']} />
              <ExpirationTimeGroup disabled={submitting} />
            </FormContainer>
          </ModalDialog>
        </form>
      )}
    />
  );
};
