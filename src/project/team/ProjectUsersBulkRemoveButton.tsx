import { projectsDeleteUser } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { RemovalActionButton } from '@/table/RemovalActionButton';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

export const ProjectUsersBulkRemoveButton = ({ rows, refetch, project }) => {
  const currentUser = useUser();

  const canRemoveUsers = hasPermission(currentUser, {
    permission: PermissionEnum.DELETE_PROJECT_PERMISSION,
    projectId: project?.uuid,
  });

  if (!canRemoveUsers || !project || project.is_removed) {
    return null;
  }

  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: async () => {
      for (const user of rows) {
        await projectsDeleteUser({
          path: { uuid: project.uuid },
          body: {
            user: user.user_uuid,
            role: user.role_name,
          },
        });
      }
    },
    successMessage: translate(
      'Users have been removed from project successfully.',
    ),
    errorMessage: translate('Unable to remove users from project.'),
    refetch,
    confirmation: {
      title: translate(
        'Remove selected users from the project: {projectName}',
        {
          projectName: <strong>{project?.name}</strong>,
        },
        formatJsxTemplate,
      ),
      body: (
        <div>
          <p>
            {translate(
              "You are about to remove these users from the project. Once removed, they'll immediately lose access and all associated permissions.",
            )}
          </p>
          <ul>
            {rows?.map((row) => (
              <li key={row.uuid}>
                {row.user_full_name || row.user_username} (
                {renderFieldOrDash(row.user_email)})
              </li>
            ))}
          </ul>
        </div>
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionButton
      title={translate('Remove')}
      action={() => deleteMutation.mutate()}
      tooltip={translate('Remove all selected users from project.')}
      disabled={deleteMutation.isPending}
    />
  );
};
