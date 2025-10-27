import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

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
