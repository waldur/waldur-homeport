import { CalendarBlankIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Project } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

const BatchSetEndDateDialog = lazyComponent(() =>
  import('./BatchSetEndDateDialog').then((module) => ({
    default: module.BatchSetEndDateDialog,
  })),
);

export const BatchSetEndDateAction = ({
  rows,
  refetch,
}: {
  rows: Project[];
  refetch;
}) => {
  const { openDialog } = useModal();
  const user = useUser();

  // The dialog PATCHes end_date, which the backend guards with DELETE_PROJECT
  // on the customer. Filtering on UPDATE_PROJECT offered the action to project
  // managers, who then got 403 on submit.
  const validProjects = useMemo(
    () =>
      rows.filter((project) =>
        hasPermission(user, {
          permission: PermissionEnum.DELETE_PROJECT,
          customerId: project.customer_uuid,
        }),
      ),
    [rows, user],
  );

  const callback = () =>
    openDialog(BatchSetEndDateDialog, {
      resolve: {
        rows: validProjects,
        refetch,
      },
    });

  if (!validProjects.length) return null;

  return (
    <ActionItem
      title={translate('Set end date')}
      action={callback}
      iconNode={<CalendarBlankIcon weight="bold" />}
    />
  );
};
