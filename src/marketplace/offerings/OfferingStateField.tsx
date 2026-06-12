import { Offering } from 'waldur-js-client';

import { StateIndicator } from '@/core/StateIndicator';

import {
  ACTIVE,
  ARCHIVED,
  DRAFT,
  PAUSED,
  UNAVAILABLE,
} from './store/constants';

interface OfferingStateFieldProps {
  offering: Pick<Offering, 'state'>;
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
          [UNAVAILABLE]: 'danger',
        }[offering.state]
      }
      hasBullet={hasBullet}
      outline
      pill
      data-testid="offering-state-field"
    />
  );
};
