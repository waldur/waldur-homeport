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
  refetch,
}) => {
  return (
    <DialogActionItem
      title={translate('View consumption history')}
      modalComponent={ViewConsumptionHistoryDialog}
      resource={row}
      extraResolve={{ refetch }}
      iconNode={<ClockCounterClockwiseIcon weight="bold" />}
    />
  );
};
