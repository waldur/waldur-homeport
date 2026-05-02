import { PlusCircleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const CreateProviderOfferingUserDialog = lazyComponent(() =>
  import('./CreateProviderOfferingUserDialog').then((module) => ({
    default: module.CreateProviderOfferingUserDialog,
  })),
);

export const CreateProviderOfferingUserButton = ({ refetch, provider }) => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      title={translate('Create')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      action={() =>
        openDialog(CreateProviderOfferingUserDialog, {
          resolve: { refetch, provider },
        })
      }
    />
  );
};
