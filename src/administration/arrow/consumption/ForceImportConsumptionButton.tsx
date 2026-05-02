import { ArrowsClockwiseIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const ForceImportConsumptionDialog = lazyComponent(() =>
  import('./ForceImportConsumptionDialog').then((module) => ({
    default: module.ForceImportConsumptionDialog,
  })),
);

interface ForceImportConsumptionButtonProps {
  refetch: () => void;
}

export const ForceImportConsumptionButton = ({
  refetch,
}: ForceImportConsumptionButtonProps) => {
  const { openDialog } = useModal();

  return (
    <ActionButton
      action={() => {
        openDialog(ForceImportConsumptionDialog, {
          resolve: { refetch },
          size: 'lg',
        });
      }}
      title={translate('Force import')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      variant="primary"
    />
  );
};
