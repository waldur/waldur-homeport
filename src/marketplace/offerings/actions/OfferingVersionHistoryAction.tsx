import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Offering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const VersionHistoryDialog = lazyComponent(() =>
  import('@/version-history/VersionHistoryDialog').then((module) => ({
    default: module.VersionHistoryDialog,
  })),
);

interface OfferingVersionHistoryActionProps {
  offering: Offering;
}

export const OfferingVersionHistoryAction: FC<
  OfferingVersionHistoryActionProps
> = ({ offering }) => {
  const { openDialog } = useModal();

  return (
    <ActionItem
      title={translate('Version history')}
      iconNode={<ClockCounterClockwiseIcon weight="bold" />}
      action={() =>
        openDialog(VersionHistoryDialog, {
          size: 'xl',
          entityType: 'offering',
          entityUuid: offering.uuid,
          entityName: offering.name,
        })
      }
    />
  );
};
