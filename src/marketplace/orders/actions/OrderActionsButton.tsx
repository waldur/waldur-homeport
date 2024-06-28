import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { CancelOrderButton } from '../details/CancelOrderButton';

import { OrderConsumerActions } from './OrderConsumerActions';

export const OrderActionsButton = ({ order, loadData }) => {
  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-dark"
        size="sm"
        className="outline-dark btn-outline border-gray-400 btn-active-secondary w-100px px-2"
      >
        {translate('Actions')}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {order.can_terminate && (
          <CancelOrderButton uuid={order.uuid} loadData={loadData} />
        )}
        <OrderConsumerActions order={order} />
      </Dropdown.Menu>
    </Dropdown>
  );
};
