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
  return (
    <StateIndicator
      label={offering.state}
      variant={
        {
          [DRAFT]: 'light',
          [ACTIVE]: 'success',
          [PAUSED]: 'warning',
          [ARCHIVED]: 'info',
        }[offering.state]
      }
      light={mode === 'light'}
      outline={mode === 'outline'}
      hasBullet={hasBullet}
      pill
    />
  );
};
