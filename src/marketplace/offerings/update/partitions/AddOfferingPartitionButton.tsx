import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      iconNode={<PlusCircleIcon weight="bold" />}
      label={translate('Add offering partition')}
      onClick={callback}
      variant="tertiary"
      size="lg"
    />
  );
};
