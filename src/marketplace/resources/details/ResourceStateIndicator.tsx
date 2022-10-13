import { StateIndicator } from '@waldur/core/StateIndicator';

import { ResourceState } from '../types';

export const ResourceStateIndicator = ({ state }: { state: ResourceState }) => (
  <StateIndicator
    variant={
      state === 'Erred' ? 'danger' : state === 'OK' ? 'primary' : 'plain'
    }
    label={state.toUpperCase()}
    active={state !== 'Erred' && state !== 'OK'}
  />
);
