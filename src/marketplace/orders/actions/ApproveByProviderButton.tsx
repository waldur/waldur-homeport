import { CheckCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceOrdersRetrieve, OrderDetails } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionButton } from '@/table/ActionButton';
import { updateEntity } from '@/table/actions';

import {
  TABLE_MARKETPLACE_ORDERS,
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '../list/constants';

const ApproveByProviderDialog = lazyComponent(() =>
  import('./ApproveByProviderDialog').then((module) => ({
    default: module.ApproveByProviderDialog,
  })),
);

interface SupportOrderApproveButtonProps {
  row: OrderDetails;
  refetch?: () => void;
  as?: React.ComponentType;
  size?: 'sm';
}

export const ApproveByProviderButton: FunctionComponent<
  SupportOrderApproveButtonProps
> = (props) => {
  const dispatch = useDispatch();

  const { openDialog } = useModal();

  const refetchAndUpdateTables = async () => {
    const newOrder = await marketplaceOrdersRetrieve({
      path: { uuid: props.row.uuid },
    }).then((response) => response.data);
    dispatch(updateEntity(TABLE_MARKETPLACE_ORDERS, props.row.uuid, newOrder));
    dispatch(updateEntity(TABLE_PUBLIC_ORDERS, props.row.uuid, newOrder));
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
  };

  const openApprovalDialog = () => {
    openDialog(ApproveByProviderDialog, {
      resolve: {
        order: props.row,
        refetch: refetchAndUpdateTables,
      },
      size: 'lg',
    });
  };

  return (
    <ActionItem
      as={props.as}
      className={props.as === ActionButton ? 'w-100' : undefined}
      title={translate('Approve')}
      action={openApprovalDialog}
      variant="primary"
      iconNode={<CheckCircleIcon weight="bold" />}
    />
  );
};
