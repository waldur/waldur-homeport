import { EyeIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const MaintenanceDetailsDialog = lazyComponent(() =>
  import('./MaintenanceDetailsDialog').then((module) => ({
    default: module.MaintenanceDetailsDialog,
  })),
);

export const MaintenanceViewAction = ({ row }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(MaintenanceDetailsDialog, {
      resolve: { maintenance: row },
      size: 'lg',
    });
  };
  return (
    <ActionItem
      title={translate('View')}
      action={callback}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
