import { FC } from 'react';
import { OfferingMergeStateEnum } from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';

import { StateIndicator } from '@/core/StateIndicator';

import { getMergeStateLabel, isActive } from './utils';

const VARIANTS: Record<OfferingMergeStateEnum, BadgeVariant> = {
  draft: 'secondary',
  previewed: 'info',
  queued: 'warning',
  running: 'warning',
  done: 'success',
  failed: 'danger',
  undoing: 'warning',
  undone: 'secondary',
};

export const OfferingMergeStateBadge: FC<{ state: OfferingMergeStateEnum }> = ({
  state,
}) => (
  <StateIndicator
    label={getMergeStateLabel(state)}
    variant={VARIANTS[state] ?? 'secondary'}
    active={isActive(state)}
    tone="outline"
    shape="pill"
  />
);
