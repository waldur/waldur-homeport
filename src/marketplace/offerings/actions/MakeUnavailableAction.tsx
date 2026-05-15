import { ProhibitIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const ChangeOfferingAvailabilityDialog = lazyComponent(() =>
  import('./ChangeOfferingAvailabilityDialog').then((module) => ({
    default: module.ChangeOfferingAvailabilityDialog,
  })),
);

interface MakeUnavailableActionProps {
  offering: any;
  refreshOffering(): void;
  canManageOfferingLifecycle: boolean;
}

export const MakeUnavailableAction: FC<MakeUnavailableActionProps> = ({
  offering,
  refreshOffering,
  canManageOfferingLifecycle,
}) => {
  const { openDialog } = useModal();

  const openChangeAvailabilityDialog = () => {
    openDialog(ChangeOfferingAvailabilityDialog, {
      resolve: { offering, refetch: refreshOffering },
      size: 'lg',
    });
  };

  if (!canManageOfferingLifecycle) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Make unavailable')}
      action={openChangeAvailabilityDialog}
      iconNode={<ProhibitIcon weight="bold" />}
    />
  );
};
