import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { Call } from '@waldur/proposals/types';
import { ActionButton } from '@waldur/table/ActionButton';

const CallOfferingCreateDialog = lazyComponent(
  () => import('./CallOfferingCreateDialog'),
  'CallOfferingCreateDialog',
);

interface AddOfferingButtonProps {
  call: Call;
  refetch(): void;
}

export const AddOfferingButton = ({
  call,
  refetch,
}: AddOfferingButtonProps) => {
  const dispatch = useDispatch();
  const openOfferingCreateDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(CallOfferingCreateDialog, {
          resolve: { call, refetch },
          size: 'lg',
        }),
      ),
    [dispatch],
  );

  return (
    <ActionButton
      title={translate('Add offering')}
      icon="fa fa-plus"
      action={openOfferingCreateDialog}
      variant="light"
    />
  );
};
