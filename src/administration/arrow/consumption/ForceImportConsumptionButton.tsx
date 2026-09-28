import { ArrowsClockwiseIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      onClick={() => {
        openDialog(ForceImportConsumptionDialog, {
          resolve: { refetch },
          size: 'lg',
        });
      }}
      label={translate('Force import')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      variant="primary"
      size="lg"
    />
  );
};
