import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import type { Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { DropdownActionItemType } from '@/table/types';

import { getArrowLicense } from './arrowLicense';

const SyncConsumptionHistoryDialog = lazyComponent(() =>
  import('./SyncConsumptionHistoryDialog').then((module) => ({
    default: module.SyncConsumptionHistoryDialog,
  })),
);

export const SyncConsumptionHistoryAction: DropdownActionItemType<Resource> = ({
  row,
  refetch,
}) => {
  if (!getArrowLicense(row)) {
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
