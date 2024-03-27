import { VStepperFormStep } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';

import { ProjectDetailsStep } from './ProjectDetailsStep';
import { FormResourceRequestsStep } from './resource-requests-step/FormResourceRequestsStep';

export const createProposalSteps: VStepperFormStep[] = [
  {
    label: translate('Project details'),
    id: 'step-project',
    component: ProjectDetailsStep,
  },
  {
    label: translate('Resource requests'),
    id: 'step-resource-requests',
    component: FormResourceRequestsStep,
  },
];
