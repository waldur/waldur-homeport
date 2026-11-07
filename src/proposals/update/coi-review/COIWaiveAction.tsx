import { ShieldIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { ConflictOfInterest } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const WaiveCOIDialog = lazyComponent(() =>
  import('./WaiveCOIDialog').then((module) => ({
    default: module.WaiveCOIDialog,
  })),
);

interface COIWaiveActionProps {
  row: ConflictOfInterest;
  fetch: () => void;
  /** Why it cannot be waived: its type requires recusal on this call. */
  disabledReason?: string;
}

export const COIWaiveAction: FC<COIWaiveActionProps> = ({
  row,
  fetch,
  disabledReason,
}) => {
  const { openDialog } = useModal();

  const handleWaive = useCallback(() => {
    openDialog(WaiveCOIDialog, {
      resolve: { coi: row, fetch },
      size: 'lg',
    });
  }, [row, fetch, openDialog]);

  return (
    <ActionItem
      title={translate('Waive')}
      action={handleWaive}
      disabled={Boolean(disabledReason)}
      tooltip={disabledReason}
      iconNode={<ShieldIcon weight="bold" />}
      iconColor="warning"
      className="text-warning"
    />
  );
};
