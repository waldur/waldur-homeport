import { FC } from 'react';
import { NestedPartition } from 'waldur-js-client';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const OfferingPartitionFormDialog = lazyComponent(() =>
  import('./OfferingPartitionFormDialog').then((module) => ({
    default: module.OfferingPartitionFormDialog,
  })),
);

export const EditOfferingPartitionButton: FC<{
  row: NestedPartition;
  offering;
  refetch;
}> = ({ offering, row, refetch }) => (
  <EditModalButton
    dialog={OfferingPartitionFormDialog}
    row={row}
    buildResolve={(r) => ({ offering, partition: r, refetch })}
  />
);
