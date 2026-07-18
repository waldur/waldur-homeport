import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  Project,
  projectsAddUser,
  projectsDeleteUser,
  projectsUpdateUser,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { GenericPermission, Role } from '@/permissions/types';
import { getProjectRoles } from '@/permissions/utils';
import { useProject } from '@/workspace/hooks';

import { ExpirationTimeGroup } from './ExpirationTimeGroup';
import {
  getOnlyOneProjectManagerTooltip,
  isProjectManagerSelectionBlocked,
} from './onlyOneProjectManager';
import { RoleGroup } from './RoleGroup';
import { useProjectHasActiveManager } from './useProjectHasActiveManager';
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

const EditUserDialogFormBody: FC<{
  handleSubmit: () => void;
  invalid: boolean;
  submitting: boolean;
  values: EditUserDialogFormData;
  project: Project;
  permission: GenericPermission;
  customerId?: string;
}> = ({
  handleSubmit,
  invalid,
  submitting,
  values,
  project,
  permission,
  customerId,
}) => {
  const permissionRoleName = permission.role_name;
  const { data: hasActiveManager } = useProjectHasActiveManager(project?.uuid);
  const isProjectManagerBlocked = isProjectManagerSelectionBlocked(
    hasActiveManager,
    values.role,
    permissionRoleName,
  );

  return (
    <form onSubmit={handleSubmit}>
      <ModalDialog
        title={translate('Edit project member')}
        footer={
          <>
            <SubmitButton
              disabled={invalid || isProjectManagerBlocked}
              disabledReason={
                isProjectManagerBlocked
                  ? getOnlyOneProjectManagerTooltip()
                  : undefined
              }
              submitting={submitting}
            >
              {translate('Save')}
            </SubmitButton>
            <CloseDialogButton />
          </>
        }
      >
        <UserGroup permission={permission} />
        <RoleGroup types={['project']} scope={{ customerId }} />
        <ExpirationTimeGroup disabled={submitting} />
      </ModalDialog>
    </form>
  );
};

export const EditUserDialog: FC<EditUserDialogProps> = ({ resolve }) => {
  const currentProject = useProject();

  const project = resolve.project || currentProject;

  const initialValues = {
    // Preselect the member's current role by name. It may be an organization
    // clone that is not in the global list, so fall back to a minimal role
    // object carrying the name (the picker matches options by name).
    role:
      getProjectRoles().find(
        ({ name }) => name === resolve.permission.role_name,
      ) ??
      ({
        name: resolve.permission.role_name,
        description: resolve.permission.role_name,
        content_type: 'project',
      } as Role),
    expiration_time: resolve.permission.expiration_time,
  };

  const saveUserMutation = useManagedMutation<any, any, EditUserDialogFormData>(
    {
      mutationFn: (formData) => savePermissions(project, formData, resolve),
      successMessage: translate('Permission has been updated.'),
      errorMessage: translate('Unable to update permission.'),
    },
  );

  return (
    <Form<EditUserDialogFormData>
      onSubmit={(values) => saveUserMutation.mutateAsync(values)}
      initialValues={initialValues}
    >
      {({ handleSubmit, submitting, invalid, values }) => (
        <EditUserDialogFormBody
          handleSubmit={handleSubmit}
          invalid={invalid}
          submitting={submitting}
          values={values}
          project={project}
          permission={resolve.permission}
          customerId={resolve.customerUuid}
        />
      )}
    </Form>
  );
};
