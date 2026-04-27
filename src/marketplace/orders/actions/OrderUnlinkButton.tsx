import { TrashIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceOrdersUnlink } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const OrderUnlinkButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to unlink the order? Unlinking will only remove object from the database, it will not trigger any cleanup',
        ),
      );
    } catch {
      return;
    }
    try {
      await marketplaceOrdersUnlink({ path: { uuid: row.uuid } });
      dispatch(showSuccess(translate('Order has been unlinked.')));
      await refetch();
      refetch();
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to unlink order.')));
    }
  }, [row, refetch]);
  return (
    <ActionItem
      title={translate('Unlink')}
      className="text-danger"
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
    />
  );
};
