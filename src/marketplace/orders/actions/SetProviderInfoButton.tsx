import { EnvelopeIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceOrdersRetrieve, OrderDetails } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { updateEntity } from '@waldur/table/actions';

import {
  TABLE_MARKETPLACE_ORDERS,
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '../list/constants';

const SetProviderInfoDialog = lazyComponent(() =>
  import('./SetProviderInfoDialog').then((module) => ({
    default: module.SetProviderInfoDialog,
  })),
);

interface SetProviderInfoButtonProps {
  row: OrderDetails;
  refetch?: () => void;
  as?: React.ComponentType;
}

export const SetProviderInfoButton: FunctionComponent<
  SetProviderInfoButtonProps
> = (props) => {
  const dispatch = useDispatch();

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

  const openDialog = () => {
    dispatch(
      openModalDialog(SetProviderInfoDialog, {
        resolve: {
          order: props.row,
          refetch: refetchAndUpdateTables,
        },
        size: 'lg',
      }),
    );
  };

  return (
    <ActionItem
      as={props.as}
      title={translate('Request info')}
      action={openDialog}
      iconNode={<EnvelopeIcon weight="bold" />}
      iconColor="info"
    />
  );
};
