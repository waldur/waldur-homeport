import { FunctionComponent } from 'react';
import { PlanUsageResponse } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const PlanUsageDialog = lazyComponent(() =>
  import('./PlanUsageDialog').then((module) => ({
    default: module.PlanUsageDialog,
  })),
);

export const PlanUsageButton: FunctionComponent<{ row: PlanUsageResponse }> = (
  props,
) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Show chart')}
      disabled={props.row.limit === null}
      tooltip={
        props.row.limit === null ? translate('Plan does not have limit') : ''
      }
      action={() =>
        openDialog(PlanUsageDialog, {
          resolve: { row: props.row },
        })
      }
    />
  );
};
