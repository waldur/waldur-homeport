import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
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
  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    dispatch(
      openModalDialog(ForceImportConsumptionDialog, {
        resolve: { refetch },
        size: 'lg',
      }),
    );
  }, [dispatch, refetch]);

  return (
    <ActionButton
      action={handleClick}
      title={translate('Force import')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      variant="primary"
    />
  );
};
