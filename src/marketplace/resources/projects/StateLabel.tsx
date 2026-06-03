import { FC } from 'react';
import { Variant } from 'react-bootstrap/types';

import { StateIndicator } from '@/core/StateIndicator';

const PROGRESSING_STATES = new Set(['Creating', 'Updating', 'Terminating']);

const STATE_VARIANTS: Record<string, Variant> = {
  Creating: 'success',
  OK: 'success',
  Updating: 'success',
  Terminating: 'success',
  Erred: 'danger',
  Terminated: 'warning',
};

export const StateLabel: FC<{ state: string }> = ({ state }) => {
  // Unrecognized/new backend states fall back to grey rather than a
  // misleading healthy-green.
  const variant = STATE_VARIANTS[state] || 'secondary';

  return (
    <StateIndicator
      label={state}
      variant={variant}
      active={PROGRESSING_STATES.has(state)}
      outline
      pill
    />
  );
};
