import { BookOpenText } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const CreditHistoryLogDialog = lazyComponent(
  () => import('./CreditHistoryLogDialog'),
  'CreditHistoryLogDialog',
);

export const CreditHistoryLogButton = () => {
  const dispatch = useDispatch();
  const openDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(CreditHistoryLogDialog, {
          size: 'xl',
        }),
      ),
    [dispatch],
  );
  return (
    <ActionButton
      title={translate('History log')}
      action={openDialog}
      iconNode={<BookOpenText />}
    />
  );
};
