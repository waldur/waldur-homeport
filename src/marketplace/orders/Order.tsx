import * as React from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showPriceSelector } from '@waldur/invoices/details/utils';
import { BillingPeriod } from '@waldur/marketplace/common/BillingPeriod';

import { getMaxUnit } from '../common/utils';

import { OrderItem } from './item/details/OrderItem';
import './Order.scss';
import { OrderItemResponse } from './types';

interface OrderProps {
  items: OrderItemResponse[];
  editable: boolean;
  onOrderItemRemove?(item: OrderItemResponse): void;
  project_uuid: string;
}

export const Order = (props: OrderProps) => {
  const showPrice = useSelector(showPriceSelector);
  const maxUnit = React.useMemo(() => getMaxUnit(props.items), [props.items]);
  return (
    <>
      <div className="table-responsive order">
        <table className="table">
          <thead>
            <tr>
              <th>{translate('Item')}</th>
              <th>{translate('Item type')}</th>
              {showPrice && (
                <>
                  {maxUnit ? (
                    <th className="text-center">
                      <BillingPeriod unit={maxUnit} />
                    </th>
                  ) : null}
                  <th className="text-center">
                    {translate('Activation price')}
                  </th>
                </>
              )}
              <th className="text-center">{translate('State')}</th>
              <th>{/* Actions column */}</th>
            </tr>
          </thead>
          <tbody>
            {props.items.map((item, index) => (
              <OrderItem
                key={index}
                item={item}
                editable={props.editable}
                project_uuid={props.project_uuid}
                showPrice={showPrice}
                maxUnit={maxUnit}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
