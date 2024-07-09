import { Check } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  approveOrderByProvider,
  getOrder,
} from '@waldur/marketplace/common/api';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';
import { updateEntity } from '@waldur/table/actions';

import {
  TABLE_MARKETPLACE_ORDERS,
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '../list/constants';

interface SupportOrderApproveButtonProps {
  orderUuid: string;
  refetch?: () => void;
}

export const ApproveByProviderButton: FunctionComponent<
  SupportOrderApproveButtonProps
> = (props) => {
  const dispatch = useDispatch();
  const { mutate, isLoading } = useMutation(async () => {
    try {
      await approveOrderByProvider(props.orderUuid);
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
      dispatch(showSuccess(translate('Order has been approved.')));
    } catch (response) {
      dispatch(
        showErrorResponse(response, translate('Unable to approve order.')),
      );
    }
  });
  return (
    <RowActionButton
      className="btn btn-sm btn-secondary"
      title={translate('Approve')}
      action={mutate}
      pending={isLoading}
      iconNode={<Check />}
      size="sm"
    />
  );
};
