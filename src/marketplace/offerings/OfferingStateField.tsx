import { StateIndicator } from '@waldur/core/StateIndicator';

import { Offering } from '../types';

import { ACTIVE, ARCHIVED, DRAFT, PAUSED } from './store/constants';

interface OfferingStateFieldProps {
  offering: Offering;
  hasBullet?: boolean;
}

export const OfferingStateField = ({
  offering,
  hasBullet,
}: OfferingStateFieldProps) => {
  return (
    <StateIndicator
      label={offering.state}
      variant={
        {
          [DRAFT]: 'default',
          [ACTIVE]: 'success',
          [PAUSED]: 'warning',
          [ARCHIVED]: 'default',
        }[offering.state]
      }
      hasBullet={hasBullet}
      outline
      pill
    />
  );
};
