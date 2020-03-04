import * as React from 'react';

import { $filter, ENV } from '@waldur/core/services';

import { Component } from './types';

interface Props {
  offeringComponent: Component;
  className?: string;
}

export const ComponentRow: React.FC<Props> = props => (
  <tr>
    <td>
      <p className="form-control-static">{props.offeringComponent.name}</p>
    </td>
    <td className={props.className}>{props.children}</td>
    <td>
      <p className="form-control-static">
        {props.offeringComponent.measured_unit || 'N/A'}
      </p>
    </td>
    {props.offeringComponent.prices.map((price, innerIndex) => (
      <td key={innerIndex}>
        <p className="form-control-static">
          {$filter('currency')(price, ENV.currency, 3)}
        </p>
      </td>
    ))}
  </tr>
);
