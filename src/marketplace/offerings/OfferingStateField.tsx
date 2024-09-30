import { StateIndicator } from '@waldur/core/StateIndicator';

import { Offering } from '../types';

import { ACTIVE, ARCHIVED, DRAFT, PAUSED } from './store/constants';

interface OfferingStateFieldProps {
  offering: Offering;
  mode?: 'light' | 'outline';
  hasBullet?: boolean;
}

export const OfferingStateField = ({
  offering,
  mode = 'light',
  hasBullet,
}: OfferingStateFieldProps) => {
  const disabled = [DRAFT, ARCHIVED].includes(offering.state);
  return (
    <StateIndicator
      label={offering.state}
      variant={
        {
          [DRAFT]: 'light',
          [ACTIVE]: 'success',
          [PAUSED]: 'warning',
          [ARCHIVED]: 'light',
        }[offering.state]
      }
      light={mode === 'light' && !disabled}
      outline={mode === 'outline' && !disabled}
      hasBullet={hasBullet}
      pill
    />
  );
};
