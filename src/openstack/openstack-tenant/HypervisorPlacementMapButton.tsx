import { MapTrifoldIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
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
    <BaseButton
      label={translate('Placement map')}
      onClick={openDialog}
      iconNode={<MapTrifoldIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};
