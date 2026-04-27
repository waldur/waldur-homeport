import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';
import type { Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { DropdownActionItemType } from '@/table/types';

const ViewConsumptionHistoryDialog = lazyComponent(() =>
  import('./ViewConsumptionHistoryDialog').then((module) => ({
    default: module.ViewConsumptionHistoryDialog,
  })),
);

export const ViewConsumptionHistoryAction: DropdownActionItemType<Resource> = ({
  row,
}) => {
  if (!row.backend_id) {
    return null;
  }
  return (
    <DialogActionItem
      title={translate('View consumption history')}
      modalComponent={ViewConsumptionHistoryDialog}
      resource={row}
      iconNode={<ClockCounterClockwiseIcon weight="bold" />}
    />
  );
};
