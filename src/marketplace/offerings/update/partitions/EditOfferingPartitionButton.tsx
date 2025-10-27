import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { NestedPartition } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const OfferingPartitionFormDialog = lazyComponent(() =>
  import('./OfferingPartitionFormDialog').then((module) => ({
    default: module.OfferingPartitionFormDialog,
  })),
);

export const EditOfferingPartitionButton: FC<{
  row: NestedPartition;
  offering;
  refetch;
}> = ({ offering, row, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(OfferingPartitionFormDialog, {
        resolve: { offering, partition: row, refetch },
      }),
    );
  };
  return <EditAction action={callback} />;
};
