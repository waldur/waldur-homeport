import { FC } from 'react';
import { OfferingAssessment } from 'waldur-js-client';

import { translate } from '@/i18n';
import { contributionStatusLabel } from '@/proposals/workflow/constants';

import { ContributionOutcomeBadge } from './ContributionOutcomeBadge';

/**
 * What the per-offering assessment concluded about one requested offering:
 * the outcome, and the conditions of a conditional acceptance, for whoever
 * decides the allocation.
 */
export const OfferingAssessmentNote: FC<{ assessment: OfferingAssessment }> = ({
  assessment,
}) => (
  <div
    className="flex flex-col gap-1 items-start"
    data-testid="offering-assessment"
  >
    <span className="text-quaternary text-xs">{assessment.step_name}</span>
    <ContributionOutcomeBadge
      outcome={assessment.outcome}
      fallback={contributionStatusLabel(assessment.status)}
    />
    {assessment.conditions && (
      <span className="text-quaternary text-xs wrap-anywhere">
        {translate('Conditions: {conditions}', {
          conditions: assessment.conditions,
        })}
      </span>
    )}
  </div>
);
