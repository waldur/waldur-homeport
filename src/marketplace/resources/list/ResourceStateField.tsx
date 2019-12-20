import * as React from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';

import { Resource } from '../types';

export const ResourceStateField = ({ row }: {row: Resource}) => (
  <StateIndicator
    label={row.state}
    variant={
      row.state === 'Erred' ? 'danger' :
      row.state === 'Terminated' ? 'warning' :
      'primary'
    }
    active={['Creating', 'Updating', 'Terminating'].includes(row.state)}
  />
);
