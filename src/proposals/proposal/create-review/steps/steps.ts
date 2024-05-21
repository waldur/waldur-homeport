import { VStepperFormStep } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';

import { FormEvaluateProjectDetailsStep } from './FormEvaluateProjectDetailsStep';
import FormSummaryStep from './FormSummaryStep';

export const createProposalSteps: VStepperFormStep[] = [
  {
    label: translate('Evaluate project details'),
    id: 'step-evaluate-project',
    component: FormEvaluateProjectDetailsStep,
  },
  {
    label: translate('Rating and comments'),
    id: 'step-summary',
    component: FormSummaryStep,
  },
];
