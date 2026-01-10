import { Question } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const PoolSummaryDialog = lazyComponent(() =>
  import('./PoolSummaryDialog').then((m) => ({
    default: m.PoolSummaryDialog,
  })),
);

export const PoolSummaryButton = () => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      action={() =>
        dispatch(
          openModalDialog(PoolSummaryDialog, {
            size: 'xl',
          }),
        )
      }
      title={translate('How it works')}
      iconNode={<Question weight="bold" />}
    />
  );
};
