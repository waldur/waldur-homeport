import { FunctionComponent } from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { ResourceState } from '@waldur/marketplace/resources/types';

interface Props {
  state: ResourceState;
}

export const OfferingRuntimeState: FunctionComponent<Props> = (props) => (
  <StateIndicator
    label={props.state}
    variant={
      props.state === 'Erred'
        ? 'danger'
        : props.state === 'Terminated'
        ? 'warning'
        : 'primary'
    }
    active={['Creating', 'Updating', 'Terminating'].includes(props.state)}
  />
);
