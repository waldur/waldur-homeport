import * as React from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { ResourceState } from '@waldur/resource/types';
import { connectAngularComponent } from '@waldur/store/connect';

const ACTIVE_STATES: ResourceState[] = [
  'Creation Scheduled',
  'Creating',
  'Update Scheduled',
  'Updating',
  'Deletion Scheduled',
  'Deleting',
];

const isActiveState = (state: ResourceState): boolean => ACTIVE_STATES.includes(state);

interface ProviderStateProps {
  provider: {
    state: ResourceState;
    error_message?: string;
  };
}

export const ProviderState = (props: ProviderStateProps) => (
  <StateIndicator
    tooltip={props.provider.error_message}
    label={translate(props.provider.state || 'N/A')}
    variant={props.provider.state === 'Erred' ? 'danger' : 'primary'}
    active={isActiveState(props.provider.state)}
  />
);

export default connectAngularComponent(ProviderState, ['provider']);
