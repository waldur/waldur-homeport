import { PlusCircleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
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
  const { openDialog } = useModal();

  return (
    <ActionButton
      action={() => {
        openDialog(CustomerMappingCreateDialog, {
          resolve: { refetch },
          size: 'lg',
        });
      }}
      title={translate('Add mapping')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};
