import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
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
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(OfferingPartitionFormDialog, {
        resolve: { offering, refetch },
      }),
    );
  };
  return (
    <ActionButton
      iconNode={<PlusCircleIcon weight="bold" />}
      title={translate('Add offering partition')}
      action={callback}
    />
  );
};
