import { useCallback, FC } from 'react';
import { Form } from 'react-final-form';
import { useSelector } from 'react-redux';
import {
  Project,
  projectsAddUser,
  projectsDeleteUser,
  projectsUpdateUser,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { GenericPermission, Role } from '@waldur/permissions/types';
import { getProjectRoles } from '@waldur/permissions/utils';
import { useNotify } from '@waldur/store/hooks';
import { getProject } from '@waldur/workspace/selectors';

import { ExpirationTimeGroup } from './ExpirationTimeGroup';
import { RoleGroup } from './RoleGroup';
import { UserGroup } from './UserGroup';

interface EditUserDialogFormData {
  role: Role;
  expiration_time: string;
}

interface EditUserDialogResolve {
  permission: GenericPermission;
  refetch();
  projectUuid?;
  customerUuid?;
  project?: Project;
}

interface EditUserDialogProps {
  resolve: EditUserDialogResolve;
}

const savePermissions = async (
  project: Project,
  formData: EditUserDialogFormData,
  resolve: EditUserDialogResolve,
) => {
  if (resolve.permission) {
    if (resolve.permission.role_name === formData.role.name) {
      await projectsUpdateUser({
        path: { uuid: project.uuid },
        body: {
          user: resolve.permission.user_uuid,
          role: formData.role.name,
          expiration_time: formData.expiration_time,
        },
      });
    } else {
      await projectsDeleteUser({
        path: { uuid: project.uuid },
        body: {
          user: resolve.permission.user_uuid,
          role: resolve.permission.role_name,
        },
      });
      await projectsAddUser({
        path: { uuid: project.uuid },
        body: {
          user: resolve.permission.user_uuid,
          role: formData.role.name,
          expiration_time: formData.expiration_time,
        },
      });
    }
  }
  await resolve.refetch();
};

export const EditUserDialog: FC<EditUserDialogProps> = ({ resolve }) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const currentProject = useSelector(getProject);

  const project = resolve.project || currentProject;

  const initialValues = {
    role: getProjectRoles().find(
      ({ name }) => name === resolve.permission.role_name,
    ),
    expiration_time: resolve.permission.expiration_time,
  };

  const saveUser = useCallback(
    async (formData: EditUserDialogFormData) => {
      try {
        await savePermissions(project, formData, resolve);
        showSuccess(translate('Permission has been updated.'));
        closeDialog();
      } catch (error) {
        showErrorResponse(error, translate('Unable to update permission.'));
      }
    },
    [project, resolve, showSuccess, showErrorResponse, closeDialog],
  );

  return (
    <Form onSubmit={saveUser} initialValues={initialValues}>
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit project member')}
            footer={
              <>
                <SubmitButton disabled={invalid} submitting={submitting}>
                  {translate('Save')}
                </SubmitButton>
                <CloseDialogButton />
              </>
            }
          >
            <UserGroup permission={resolve.permission} />
            <RoleGroup types={['project']} />
            <ExpirationTimeGroup disabled={submitting} />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
