import * as React from 'react';

export const OrderItemDetailsSection: React.SFC = props => (
  <p className="form-control-static">
    <strong>{props.children}</strong>
  </p>
);
