import { PlusCircleIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      onClick={() => {
        openDialog(CustomerMappingCreateDialog, {
          resolve: { refetch },
          size: 'lg',
        });
      }}
      label={translate('Add mapping')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      size="lg"
    />
  );
};
