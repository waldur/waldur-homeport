import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { useWhenRunsFinish } from './bulkSteps';

const BulkStepDecisionsDialog = lazyComponent(() =>
  import('./BulkStepDecisionsDialog').then((module) => ({
    default: module.BulkStepDecisionsDialog,
  })),
);

/** Opens the call's runs deciding a step for many proposals: a run in the
 * background is followed, and a finished one read again, from here. While
 * the proposals list shows, a run that ends -- its dialog closed or not --
 * has the list read again. */
export const BulkStepDecisionsButton: FC<{
  callUuid: string;
  refetch?(): void;
}> = ({ callUuid, refetch }) => {
  const { openDialog } = useModal();
  useWhenRunsFinish(callUuid, refetch);
  return (
    <BaseButton
      variant="tertiary"
      iconNode={<ClockCounterClockwiseIcon weight="bold" />}
      label={translate('Steps decided in bulk')}
      onClick={() =>
        openDialog(BulkStepDecisionsDialog, {
          resolve: { callUuid },
          size: 'lg',
        })
      }
    />
  );
};
