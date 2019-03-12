import * as React from 'react';

import { OrderItemDetailsField } from '@waldur/marketplace/orders/item/details/OrderItemDetailsField';
import { OrderItemDetailsProps } from '@waldur/marketplace/types';
import BooleanField from '@waldur/table-react/BooleanField';

const renderValue = value => value ? value : <span>&mdash;</span>;

export const OfferingConfigurationDetails = (props: OrderItemDetailsProps) => {
  const options = props.offering.options.options || {};
  const attributes = props.orderItem.attributes;
  const keys = Object.keys(options).filter(key => attributes[key] !== undefined);
  return (
    <>
      {keys.map((key, index) => (
        <OrderItemDetailsField label={options[key].label} key={index}>
          {typeof attributes[key] === 'boolean' ? <BooleanField value={attributes[key]}/> : renderValue(attributes[key])}
        </OrderItemDetailsField>
      ))}
    </>
  );
};
