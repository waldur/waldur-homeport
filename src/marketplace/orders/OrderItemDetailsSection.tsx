import * as React from 'react';

interface OrderItemDetailsSectionProps {
  children: React.ReactNode;
}

export const OrderItemDetailsSection = (props: OrderItemDetailsSectionProps) => (
  <p className="form-control-static">
    <strong>{props.children}</strong>
  </p>
);
