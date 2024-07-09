import { Prohibit } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  getOrder,
  rejectOrderByProvider,
} from '@waldur/marketplace/common/api';
import {
  TABLE_MARKETPLACE_ORDERS,
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '@waldur/marketplace/orders/list/constants';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';
import { updateEntity } from '@waldur/table/actions';

interface RejectByProviderButtonProps {
  orderUuid: string;
  refetch?: () => void;
}

export const RejectByProviderButton: FunctionComponent<
  RejectByProviderButtonProps
> = (props) => {
  const dispatch = useDispatch();
  const { mutate, isLoading } = useMutation(async () => {
    try {
      await rejectOrderByProvider(props.orderUuid);
      const newOrder = await getOrder(props.orderUuid);
      dispatch(
        updateEntity(TABLE_MARKETPLACE_ORDERS, props.orderUuid, newOrder),
      );
      // update orders table on the main page
      dispatch(updateEntity(TABLE_PUBLIC_ORDERS, props.orderUuid, newOrder));
      // update pending orders tables on the drawer
      dispatch(
        updateEntity(TABLE_PENDING_PUBLIC_ORDERS, props.orderUuid, newOrder),
      );
      dispatch(
        updateEntity(
          TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
          props.orderUuid,
          newOrder,
        ),
      );

      if (props.refetch) await props.refetch();

      dispatch(showSuccess(translate('Order has been rejected.')));
    } catch (response) {
      dispatch(
        showErrorResponse(response, translate('Unable to reject order.')),
      );
    }
  });
  return (
    <RowActionButton
      className="btn btn-sm btn-secondary"
      title={translate('Reject')}
      action={mutate}
      pending={isLoading}
      iconNode={<Prohibit />}
      size="sm"
    />
  );
};
