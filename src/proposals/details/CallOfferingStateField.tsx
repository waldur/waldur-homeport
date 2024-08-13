import { StateIndicator } from '@waldur/core/StateIndicator';

import { CallOfferingState } from '../types';
import { formatCallOfferingState } from '../utils';

export const CallOfferingStateField = ({
  row,
}: {
  row: { state: CallOfferingState };
}) => (
  <StateIndicator
    label={formatCallOfferingState(row.state)}
    variant={row.state === 'accepted' ? 'success' : 'warning'}
    pill
    light
  />
);
