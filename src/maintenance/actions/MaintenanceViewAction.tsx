import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const MaintenanceDetailsDialog = lazyComponent(() =>
  import('./MaintenanceDetailsDialog').then((module) => ({
    default: module.MaintenanceDetailsDialog,
  })),
);

export const MaintenanceViewAction = ({ row }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(MaintenanceDetailsDialog, {
        resolve: { maintenance: row },
        size: 'lg',
      }),
    );
  };
  return (
    <ActionItem
      title={translate('View')}
      action={callback}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
