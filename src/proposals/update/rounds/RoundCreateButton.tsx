import { PlusCircle } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { Call } from '@waldur/proposals/types';
import { ActionButton } from '@waldur/table/ActionButton';

const CallRoundCreateDialog = lazyComponent(
  () => import('./CallRoundCreateDialog'),
  'CallRoundCreateDialog',
);

interface RoundCreateButtonProps {
  call: Call;
  refetch(): void;
}

export const RoundCreateButton = ({
  call,
  refetch,
}: RoundCreateButtonProps) => {
  const dispatch = useDispatch();
  const openRoundCreateDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(CallRoundCreateDialog, {
          resolve: { call, refetch },
          size: 'lg',
        }),
      ),
    [dispatch],
  );

  return (
    <ActionButton
      title={translate('New round')}
      iconNode={<PlusCircle />}
      action={openRoundCreateDialog}
      variant="light"
    />
  );
};
