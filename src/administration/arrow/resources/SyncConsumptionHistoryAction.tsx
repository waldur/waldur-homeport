import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import type { Resource } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { DropdownActionItemType } from '@waldur/table/types';

const SyncConsumptionHistoryDialog = lazyComponent(() =>
  import('./SyncConsumptionHistoryDialog').then((module) => ({
    default: module.SyncConsumptionHistoryDialog,
  })),
);

export const SyncConsumptionHistoryAction: DropdownActionItemType<Resource> = ({
  row,
  refetch,
}) => {
  if (!row.backend_id) {
    return null;
  }
  return (
    <DialogActionItem
      title={translate('Sync consumption history')}
      modalComponent={SyncConsumptionHistoryDialog}
      resource={row}
      extraResolve={{ refetch }}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
