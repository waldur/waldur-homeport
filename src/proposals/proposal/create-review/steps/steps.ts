import { translate } from '@/i18n';
import { VStepperFormStep } from '@/wizard';

import { ProposalDetailsOverviewStep } from '../../create/ProposalDetailsOverviewStep';
import { FormResourceRequestsStep } from '../../create/resource-requests-step/FormResourceRequestsStep';

import { FormProjectDetailsStep } from './FormProjectDetailsStep';
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
];
