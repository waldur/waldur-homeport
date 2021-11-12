import { FunctionComponent, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  getOrderDetails,
  rejectOrderItem,
} from '@waldur/marketplace/common/api';
import { TABLE_SUPPORT_ORDERS } from '@waldur/marketplace/orders/item/list/constants';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { updateEntity } from '@waldur/table/actions';

interface SupportOrderItemRejectButtonProps {
  itemUuid: string;
  orderUuid: string;
}

export const SupportOrderItemRejectButton: FunctionComponent<SupportOrderItemRejectButtonProps> =
  (props) => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const handler = useCallback(async () => {
      setLoading(true);
      try {
        await rejectOrderItem(props.itemUuid);
        const order = await getOrderDetails(props.orderUuid);
        dispatch(updateEntity(TABLE_SUPPORT_ORDERS, props.orderUuid, order));
        dispatch(showSuccess(translate('Order item has been rejected.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to reject order item.'),
          ),
        );
      }
      setLoading(false);
    }, [setLoading, dispatch, props.itemUuid]);
    return (
      <ActionButton
        className="btn btn-sm btn-default"
        title={translate('Reject')}
        action={handler}
        disabled={loading}
        icon={loading ? 'fa fa-spinner fa-spin' : 'fa fa-ban'}
      />
    );
  };
