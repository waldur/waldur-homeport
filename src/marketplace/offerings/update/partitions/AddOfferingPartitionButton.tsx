import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const OfferingPartitionFormDialog = lazyComponent(() =>
  import('./OfferingPartitionFormDialog').then((module) => ({
    default: module.OfferingPartitionFormDialog,
  })),
);

export const AddOfferingPartitionButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(OfferingPartitionFormDialog, {
      resolve: { offering, refetch },
    });
  };
  return (
    <ActionButton
      iconNode={<PlusCircleIcon weight="bold" />}
      title={translate('Add offering partition')}
      action={callback}
    />
  );
};
