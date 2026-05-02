import { Project, projectsDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser } from '@/workspace/hooks';

export const BatchDeleteProjectAction = ({
  rows,
  refetch,
}: {
  rows: Project[];
  refetch;
}) => {
  const user = useUser();

  const deletableRows = rows.filter(
    (project) =>
      !project.is_removed &&
      (hasPermission(user, {
        permission: PermissionEnum.DELETE_PROJECT,
        customerId: project.customer_uuid,
      }) ||
        hasPermission(user, {
          permission: PermissionEnum.DELETE_PROJECT,
          projectId: project.uuid,
        })),
  );

  if (deletableRows.length === 0) {
    return null;
  }

  const { mutate, isPending } = useBatchMutation({
    rows: deletableRows,
    mutationFn: (project) => projectsDestroy({ path: { uuid: project.uuid } }),
    refetch,
    successMessage: translate('{count} project(s) deleted successfully.', {
      count: deletableRows.length,
    }),
    renderPartialSuccessMessage: (count) =>
      translate('{count} project(s) deleted successfully.', {
        count,
      }),
    renderErrorMessage: (count) =>
      translate('{count} project(s) could not be deleted.', {
        count,
      }),
    confirmation: {
      title: translate('Delete {count} project(s)', {
        count: deletableRows.length,
      }),
      body: (
        <div>
          <p>
            {translate(
              'Are you sure you want to delete the following projects? This action cannot be undone.',
            )}
          </p>
          <ul>
            {deletableRows.map((project) => (
              <li key={project.uuid}>{project.name}</li>
            ))}
          </ul>
          {deletableRows.length !== rows.length &&
            translate(
              '{count} project(s) were excluded because you lack permission to delete them.',
              { count: rows.length - deletableRows.length },
              formatJsxTemplate,
            )}
        </div>
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending || deletableRows.length !== rows.length}
      tooltip={
        deletableRows.length !== rows.length
          ? translate(
              'Some selected projects cannot be deleted due to insufficient permissions.',
            )
          : undefined
      }
    />
  );
};
