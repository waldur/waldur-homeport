import { VStepperFormStep } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';

import { ProposalDetailsOverviewStep } from '../../create/ProposalDetailsOverviewStep';
import { FormResourceRequestsStep } from '../../create/resource-requests-step/FormResourceRequestsStep';

import { FormProjectDetailsStep } from './FormProjectDetailsStep';
import FormSummaryStep from './FormSummaryStep';
import { ReviewTeamStep } from './ReviewTeamStep';

export const createReviewSteps: VStepperFormStep[] = [
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
  {
    label: translate('Summary'),
    id: 'step-summary',
    component: FormSummaryStep,
  },
];
