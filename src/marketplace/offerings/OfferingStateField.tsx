import { Offering } from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';

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

const OFFERING_STATE_VARIANTS: Record<string, BadgeVariant> = {
  [DRAFT]: 'neutral',
  [ACTIVE]: 'success',
  [PAUSED]: 'warning',
  [ARCHIVED]: 'neutral',
  [UNAVAILABLE]: 'danger',
};

export const OfferingStateField = ({
  offering,
  hasBullet,
}: OfferingStateFieldProps) => {
  return (
    <StateIndicator
      label={offering.state}
      variant={OFFERING_STATE_VARIANTS[offering.state] || 'neutral'}
      hasBullet={hasBullet}
      tone="outline"
      shape="pill"
      data-testid="offering-state-field"
    />
  );
};
