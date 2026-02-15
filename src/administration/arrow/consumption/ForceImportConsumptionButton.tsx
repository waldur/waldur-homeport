import { ArrowsClockwise } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

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
      iconNode={<ArrowsClockwise weight="bold" />}
      variant="primary"
    />
  );
};
