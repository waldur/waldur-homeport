import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const ChangeOfferingAvailabilityDialog = lazyComponent(() =>
  import('./ChangeOfferingAvailabilityDialog').then((module) => ({
    default: module.ChangeOfferingAvailabilityDialog,
  })),
);

interface RestoreOfferingActionProps {
  offering: any;
  refreshOffering(): void;
  className?: string;
}

export const RestoreOfferingAction: FC<RestoreOfferingActionProps> = ({
  offering,
  refreshOffering,
  className,
}) => {
  const { openDialog } = useModal();

  const openChangeAvailabilityDialog = () => {
    openDialog(ChangeOfferingAvailabilityDialog, {
      resolve: { offering, refetch: refreshOffering },
      size: 'lg',
    });
  };

  return (
    <ActionButton
      variant="tertiary"
      action={openChangeAvailabilityDialog}
      className={className}
      title={translate('Restore')}
      iconNode={<ArrowClockwiseIcon weight="bold" />}
    />
  );
};
