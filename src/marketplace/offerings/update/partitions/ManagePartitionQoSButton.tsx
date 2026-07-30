import { ListChecksIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { NestedPartition } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const SetPartitionQoSDialog = lazyComponent(() =>
  import('./SetPartitionQoSDialog').then((module) => ({
    default: module.SetPartitionQoSDialog,
  })),
);

export const ManagePartitionQoSButton: FC<{
  row: NestedPartition;
  offering;
  refetch;
}> = ({ offering, row, refetch }) => {
  const { openDialog } = useModal();
  // Hide when the offering has no QoS catalog — nothing to allow-list.
  if (!offering?.qos_profiles?.length) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Manage QoS')}
      iconNode={<ListChecksIcon weight="bold" />}
      action={() =>
        openDialog(SetPartitionQoSDialog, {
          resolve: { offering, partition: row, refetch },
        })
      }
    />
  );
};
