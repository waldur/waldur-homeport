import { StateIndicator } from '@waldur/core/StateIndicator';

import { ProposalCall } from './types';

interface CallStateFieldProps {
  call: ProposalCall;
  roundless?: boolean;
}

export const CallStateField = ({ call, roundless }: CallStateFieldProps) => (
  <StateIndicator
    label={call.state}
    variant={['Draft', 'Archived'].includes(call.state) ? 'danger' : 'success'}
    active={['Active'].includes(call.state)}
    roundless={roundless}
  />
);
