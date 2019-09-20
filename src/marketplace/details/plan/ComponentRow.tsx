import * as React from 'react';
import { ReactNode } from 'react';

import { $filter, ENV } from '@waldur/core/services';

import { Component } from './types';

export const ComponentRow = (props: {component: Component, className?: string, field: ReactNode}) => (
  <tr>
    <td>
      <p className={props.className}>{props.component.label}</p>
    </td>
    <td>{props.field}</td>
    <td>
      <p className={props.className}>{props.component.units}</p>
    </td>
    {props.component.prices.map((price, innerIndex) => (
      <td key={innerIndex}>
        <p className={props.className}>{$filter('currency')(price, ENV.currency, 3)}</p>
      </td>
    ))}
  </tr>
);
