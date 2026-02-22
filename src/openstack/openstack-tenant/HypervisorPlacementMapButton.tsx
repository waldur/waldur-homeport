import { MapTrifoldIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { useUser } from '@waldur/workspace/hooks';

const HypervisorPlacementMapDialog = lazyComponent(() =>
  import('./HypervisorPlacementMapDialog').then((m) => ({
    default: m.HypervisorPlacementMapDialog,
  })),
);

interface Props {
  tenantUuid: string;
}

export const HypervisorPlacementMapButton: FC<Props> = ({ tenantUuid }) => {
  const user = useUser();
  const dispatch = useDispatch();

  const openDialog = useCallback(() => {
    dispatch(
      openModalDialog(HypervisorPlacementMapDialog, {
        resolve: { tenantUuid },
        size: 'xl',
      }),
    );
  }, [dispatch, tenantUuid]);

  if (!user?.is_staff) return null;

  return (
    <ActionButton
      title={translate('Placement map')}
      action={openDialog}
      iconNode={<MapTrifoldIcon weight="bold" />}
      variant="tertiary"
    />
  );
};
