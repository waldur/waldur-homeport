import * as React from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

type ProviderStateType =
  | 'OK'
  | 'Erred'
  | 'In Sync'
  | 'Creation Scheduled'
  | 'Creating'
  | 'Update Scheduled'
  | 'Updating'
  | 'Deletion Scheduled'
  | 'Deleting'
  ;

const ACTIVE_STATES: ProviderStateType[] = [
  'Creation Scheduled',
  'Creating',
  'Update Scheduled',
  'Updating',
  'Deletion Scheduled',
  'Deleting',
];

const isActiveState = (state: ProviderStateType): boolean => ACTIVE_STATES.includes(state);

interface ProviderStateIndicatorProps {
  provider: {
    state: ProviderStateType;
    error_message: string;
  };
}

export const ProviderStateIndicator = (props: ProviderStateIndicatorProps) => (
  <StateIndicator
    tooltip={props.provider.error_message}
    label={translate(props.provider.state || 'N/A')}
    variant={props.provider.state === 'Erred' ? 'danger' : 'primary'}
    active={isActiveState(props.provider.state)}
  />
);

export default connectAngularComponent(ProviderStateIndicator, ['provider']);
