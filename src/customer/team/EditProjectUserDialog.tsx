import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
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

const FORM_ID = 'EditProjectUserDialog';

interface EditProjectUserDialogFormData {
  role: Role;
  expiration_time: string;
}

interface EditProjectUserDialogResolve {
  project: NestedProjectPermission;
  customer: CustomerUser;
  refetch;
}

interface EditProjectUserDialogOwnProps {
  resolve: EditProjectUserDialogResolve;
}

const savePermissions = async (
  formData: EditProjectUserDialogFormData,
  resolve: EditProjectUserDialogResolve,
) => {
  if (resolve.project.role_name === formData.role.name) {
    await projectsUpdateUser({
      path: { uuid: resolve.project.uuid },
      body: {
        user: resolve.customer.uuid,
        role: formData.role.name,
        expiration_time: formData.expiration_time,
      },
    });
  } else {
    await projectsDeleteUser({
      path: { uuid: resolve.project.uuid },
      body: {
        user: resolve.customer.uuid,
        role: resolve.project.role_name,
      },
    });
    await projectsAddUser({
      path: { uuid: resolve.project.uuid },
      body: {
        user: resolve.customer.uuid,
        role: formData.role.name,
        expiration_time: formData.expiration_time,
      },
    });
  }
  await resolve.refetch();
};

export const EditProjectUserDialog = connect(
  (_, ownProps: EditProjectUserDialogOwnProps) => ({
    initialValues: {
      role: getProjectRoles().find(
        ({ name }) => name === ownProps.resolve.project.role_name,
      ),
      expiration_time: ownProps.resolve.project.expiration_time,
    },
  }),
)(
  reduxForm<EditProjectUserDialogFormData, EditProjectUserDialogOwnProps>({
    form: FORM_ID,
  })(({ submitting, handleSubmit, resolve }) => {
    const saveMutation = useManagedMutation<
      any,
      any,
      EditProjectUserDialogFormData
    >({
      mutationFn: (formData) => savePermissions(formData, resolve),
      errorMessage: translate('Unable to update permission.'),
    });

    return (
      <form
        onSubmit={handleSubmit((values) => saveMutation.mutateAsync(values))}
      >
        <ModalDialog
          title={translate('Edit project member')}
          footer={
            <>
              <CloseDialogButton />
              <SubmitButton submitting={saveMutation.isPending}>
                {translate('Save')}
              </SubmitButton>
            </>
          }
        >
          <FormContainer submitting={saveMutation.isPending}>
            <UserGroup permission={resolve.customer} />
            <ProjectGroup project={resolve.project} />
            <RoleGroup types={['project']} legacyField />
            <ExpirationTimeGroup disabled={submitting} legacyField />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
