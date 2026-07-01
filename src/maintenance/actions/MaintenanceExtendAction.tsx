import { ClockClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { MaintenanceAnnouncement } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const MaintenanceExtendDialog = lazyComponent(() =>
  import('./MaintenanceExtendDialog').then((module) => ({
    default: module.MaintenanceExtendDialog,
  })),
);

interface MaintenanceExtendActionProps {
  row: MaintenanceAnnouncement;
  refetch: () => void;
}

export const MaintenanceExtendAction: FC<MaintenanceExtendActionProps> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(MaintenanceExtendDialog, {
      resolve: { maintenance: row, refetch },
    });
  };
  return (
    <ActionItem
      title={translate('Extend')}
      action={callback}
      iconNode={<ClockClockwiseIcon weight="bold" />}
    />
  );
};
