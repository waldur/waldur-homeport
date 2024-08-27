import { VStepperFormStep } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';

import { FormResourceRequestsStep } from '../../create/resource-requests-step/FormResourceRequestsStep';

import { FormProjectDetailsStep } from './FormProjectDetailsStep';
import FormSummaryStep from './FormSummaryStep';

export const createReviewSteps: VStepperFormStep[] = [
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
    label: translate('Summary'),
    id: 'step-summary',
    component: FormSummaryStep,
  },
];
