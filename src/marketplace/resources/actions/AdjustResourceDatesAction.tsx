import { CalendarPlusIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';
import { Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

const AdjustResourceDatesDialog = lazyComponent(() =>
  import('./AdjustResourceDatesDialog').then((module) => ({
    default: module.AdjustResourceDatesDialog,
  })),
);

interface AdjustResourceDatesActionProps {
  resource: Resource;
  refetch?(): void;
}

export const AdjustResourceDatesAction = ({
  resource,
  refetch,
}: AdjustResourceDatesActionProps) => {
  const isStaff = useSelector(isStaffSelector);
  const { openDialog } = useModal();

  const hasPrepaidComponents = resource.offering_components?.some(
    (c) => c.is_prepaid === true,
  );

  if (!isStaff || !hasPrepaidComponents) {
    return null;
  }

  const callback = () =>
    openDialog(AdjustResourceDatesDialog, {
      resolve: { resource, refetch },
    });

  return (
    <ActionItem
      title={translate('Adjust start/end dates')}
      action={callback}
      staff
      iconNode={<CalendarPlusIcon weight="bold" />}
    />
  );
};
