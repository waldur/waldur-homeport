import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

import type { PlanUsageRowProps } from './types';

const PlanUsageDialog = lazyComponent(
  () => import('./PlanUsageDialog'),
  'PlanUsageDialog',
);

export const PlanUsageButton: FunctionComponent<PlanUsageRowProps> = (
  props,
) => {
  const dispatch = useDispatch();
  return (
    <RowActionButton
      title={translate('Show chart')}
      disabled={props.row.limit === null}
      tooltip={
        props.row.limit === null ? translate('Plan does not have limit') : ''
      }
      action={() =>
        dispatch(
          openModalDialog(PlanUsageDialog, {
            resolve: { row: props.row },
          }),
        )
      }
      size="sm"
    />
  );
};
