import { CalendarBlankIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

const MultiSetEndDateDialog = lazyComponent(() =>
  import('./MultiSetEndDateDialog').then((module) => ({
    default: module.MultiSetEndDateDialog,
  })),
);

const SELECTABLE_STATES = new Set(['OK', 'Erred']);

export const MultiSetEndDateAction = ({
  rows,
  refetch,
}: {
  rows: Resource[];
  refetch(): void;
}) => {
  const { openDialog } = useModal();
  const user = useUser();

  const validResources = useMemo(
    () =>
      rows.filter(
        (resource) =>
          SELECTABLE_STATES.has(resource.state) &&
          hasPermission(user, {
            permission: PermissionEnum.SET_RESOURCE_END_DATE,
            projectId: resource.project_uuid,
            customerId: resource.customer_uuid,
          }),
      ),
    [rows, user],
  );

  const callback = () =>
    openDialog(MultiSetEndDateDialog, {
      resolve: {
        rows: validResources,
        refetch,
      },
    });

  if (!validResources.length) return null;

  return (
    <ActionItem
      title={translate('Set termination date')}
      action={callback}
      iconNode={<CalendarBlankIcon weight="bold" />}
    />
  );
};
