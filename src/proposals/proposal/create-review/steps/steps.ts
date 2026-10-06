import { translate } from '@/i18n';
import { VStepperFormStep } from '@/wizard';

import { ProposalDetailsOverviewStep } from '../../create/ProposalDetailsOverviewStep';
import { FormResourceRequestsStep } from '../../create/resource-requests-step/FormResourceRequestsStep';

import { FormProjectDetailsStep } from './FormProjectDetailsStep';
import { ReviewComplianceStep } from './ReviewComplianceStep';
import { ReviewTeamStep } from './ReviewTeamStep';

/** `withCompliance`: the proposal was submitted under a compliance checklist
 *  (see `proposalHasCompliance`). */
export const createReviewSteps = (
  withCompliance = false,
): VStepperFormStep[] => {
  const steps: VStepperFormStep[] = [
    {
      label: translate('Details overview'),
      id: 'step-general',
      component: ProposalDetailsOverviewStep,
    },
    {
      label: translate('Project details'),
      id: 'step-project',
      component: FormProjectDetailsStep,
    },
    {
      label: translate('Resource requests'),
      id: 'step-resource-requests',
      component: FormResourceRequestsStep,
    },
    {
      label: translate('Project team'),
      id: 'step-team',
      component: ReviewTeamStep,
    },
  ];

  // Same position as in the applicant's form: after project details.
  if (withCompliance) {
    steps.splice(2, 0, {
      label: translate('Compliance checklist'),
      id: 'step-compliance',
      component: ReviewComplianceStep,
    });
  }

  return steps;
};
