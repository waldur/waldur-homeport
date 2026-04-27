import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const CustomerMappingCreateDialog = lazyComponent(() =>
  import('./CustomerMappingCreateDialog').then((module) => ({
    default: module.CustomerMappingCreateDialog,
  })),
);

interface CustomerMappingCreateButtonProps {
  refetch: () => void;
}

export const CustomerMappingCreateButton = ({
  refetch,
}: CustomerMappingCreateButtonProps) => {
  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    dispatch(
      openModalDialog(CustomerMappingCreateDialog, {
        resolve: { refetch },
        size: 'lg',
      }),
    );
  }, [dispatch, refetch]);

  return (
    <ActionButton
      action={handleClick}
      title={translate('Add mapping')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};
