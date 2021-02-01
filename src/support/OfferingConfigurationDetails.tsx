import { FunctionComponent } from 'react';

import { OrderItemDetailsField } from '@waldur/marketplace/orders/item/details/OrderItemDetailsField';
import { OrderItemDetailsProps } from '@waldur/marketplace/types';
import { BooleanField } from '@waldur/table/BooleanField';

const renderValue = (value) => (value ? value : <>&mdash;</>);

export const OfferingConfigurationDetails: FunctionComponent<OrderItemDetailsProps> = (
  props,
) => {
  const options = props.offering.options.options || {};
  const attributes = props.orderItem.attributes;
  const keys = Object.keys(options).filter(
    (key) => attributes[key] !== undefined,
  );
  return (
    <>
      {keys.map((key, index) => (
        <OrderItemDetailsField label={options[key].label} key={index}>
          {typeof attributes[key] === 'boolean' ? (
            <BooleanField value={attributes[key]} />
          ) : (
            renderValue(attributes[key])
          )}
        </OrderItemDetailsField>
      ))}
    </>
  );
};
