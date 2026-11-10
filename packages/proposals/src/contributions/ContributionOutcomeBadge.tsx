import { FC } from 'react';
import { Badge } from 'waldur-ui';

import {
  contributionOutcomeLabel,
  contributionOutcomeVariant,
} from '../outcomes';

/**
 * What a contribution concluded, coloured by how it went. Without an outcome
 * yet, `fallback` (its status, say) is shown in the neutral colour.
 */
export const ContributionOutcomeBadge: FC<{
  outcome?: string | null;
  fallback?: string;
}> = ({ outcome, fallback }) => (
  <Badge
    variant={contributionOutcomeVariant(outcome)}
    size="sm"
    shape="pill"
    tone="outline"
  >
    {outcome ? contributionOutcomeLabel(outcome) : fallback}
  </Badge>
);
