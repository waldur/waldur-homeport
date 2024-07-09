import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { CancelOrderButton } from '../details/CancelOrderButton';

import { OrderConsumerActions } from './OrderConsumerActions';

export const OrderActionsButton = ({ order, loadData }) => {
  return (
    <ActionsDropdownComponent>
      {order.can_terminate && (
        <CancelOrderButton uuid={order.uuid} loadData={loadData} />
      )}
      <OrderConsumerActions order={order} />
    </ActionsDropdownComponent>
  );
};
