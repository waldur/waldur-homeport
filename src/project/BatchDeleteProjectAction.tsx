import { TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Project, projectsDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { useUser } from '@waldur/workspace/hooks';

export const BatchDeleteProjectAction = ({
  rows,
  refetch,
}: {
  rows: Project[];
  refetch;
}) => {
  const dispatch = useDispatch();
  const user = useUser();
  const [pending, setPending] = useState(false);

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

  const callback = async () => {
    try {
      const projectList = deletableRows.map((project) => (
        <li key={project.uuid}>{project.name}</li>
      ));

      await waitForConfirmation(
        dispatch,
        translate('Delete {count} project(s)', {
          count: deletableRows.length,
        }),
        <div>
          <p>
            {translate(
              'Are you sure you want to delete the following projects? This action cannot be undone.',
            )}
          </p>
          <ul>{projectList}</ul>
          {deletableRows.length !== rows.length &&
            translate(
              '{count} project(s) were excluded because you lack permission to delete them.',
              { count: rows.length - deletableRows.length },
              formatJsxTemplate,
            )}
        </div>,
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setPending(true);
      const results = await Promise.allSettled(
        deletableRows.map((project) =>
          projectsDestroy({ path: { uuid: project.uuid } }),
        ),
      );
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (succeeded > 0) {
        dispatch(
          showSuccess(
            translate('{count} project(s) deleted successfully.', {
              count: succeeded,
            }),
          ),
        );
      }
      if (failed > 0) {
        dispatch(
          showErrorResponse(
            (
              results.find(
                (r) => r.status === 'rejected',
              ) as PromiseRejectedResult
            )?.reason,
            translate('{count} project(s) could not be deleted.', {
              count: failed,
            }),
          ),
        );
      }
      await refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('An error occurred on project removal.'),
        ),
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <ActionItem
      title={translate('Delete')}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
      disabled={pending || deletableRows.length !== rows.length}
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
