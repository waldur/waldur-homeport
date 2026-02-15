import { ProhibitIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  marketplaceOrdersRejectByProvider,
  marketplaceOrdersRetrieve,
  OrderDetails,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import {
  TABLE_MARKETPLACE_ORDERS,
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '@waldur/marketplace/orders/list/constants';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { SITE_AGENT_PLUGIN } from '@waldur/site-agent/constants';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { updateEntity } from '@waldur/table/actions';

interface RejectByProviderButtonProps {
  row: OrderDetails;
  refetch?: () => void;
  as?: React.ComponentType;
}

export const RejectByProviderButton: FunctionComponent<
  RejectByProviderButtonProps
> = (props) => {
  const dispatch = useDispatch();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      const isSiteAgentOrder = props.row.offering_type === SITE_AGENT_PLUGIN;

      let result;
      try {
        result = await waitForConfirmation(
          dispatch,
          translate('Reject order'),
          isSiteAgentOrder
            ? translate(
                'Provider rejection is expected to be done by Waldur site agent. Doing it manually can lead to a broken state.',
              )
            : translate('Are you sure you want to reject this order?'),
          {
            showInput: true,
            inputLabel: translate('Rejection reason (optional)'),
            positiveButton: translate('Reject'),
          },
        );
      } catch {
        return;
      }

      try {
        await marketplaceOrdersRejectByProvider({
          path: { uuid: props.row.uuid },
          body: { provider_rejection_comment: result?.input },
        });
        const newOrder = await marketplaceOrdersRetrieve({
          path: { uuid: props.row.uuid },
        }).then((response) => response.data);
        dispatch(
          updateEntity(TABLE_MARKETPLACE_ORDERS, props.row.uuid, newOrder),
        );
        // update orders table on the main page
        dispatch(updateEntity(TABLE_PUBLIC_ORDERS, props.row.uuid, newOrder));
        // update pending orders tables on the drawer
        dispatch(
          updateEntity(TABLE_PENDING_PUBLIC_ORDERS, props.row.uuid, newOrder),
        );
        dispatch(
          updateEntity(
            TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
            props.row.uuid,
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
    },
  });
  return (
    <ActionItem
      as={props.as}
      className={
        props.as === Button ? 'btn-danger btn-sm w-100' : 'text-danger'
      }
      title={translate('Reject')}
      action={mutate}
      disabled={isLoading}
      iconNode={<ProhibitIcon weight="bold" />}
      iconColor="danger"
    />
  );
};
