import { StateIndicator } from '@waldur/core/StateIndicator';

import { Call } from './types';

interface CallStateFieldProps {
  call: Call;
  roundless?: boolean;
}

export const CallStateField = ({ call, roundless }: CallStateFieldProps) => (
  <StateIndicator
    label={call.state}
    variant={['draft', 'archived'].includes(call.state) ? 'danger' : 'success'}
    active={call.state === 'active'}
    roundless={roundless}
  />
);
