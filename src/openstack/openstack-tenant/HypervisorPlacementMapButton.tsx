import { MapTrifoldIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

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
  const { openDialog: openModal } = useModal();

  const openDialog = useCallback(() => {
    openModal(HypervisorPlacementMapDialog, {
      resolve: { tenantUuid },
      size: 'xl',
    });
  }, [tenantUuid]);

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
