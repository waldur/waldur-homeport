import { translate } from '@waldur/i18n';
import { ProposalCreationFormStep } from '@waldur/proposals/types';

import { ProjectDetailsStep } from './ProjectDetailsStep';
import { FormResourceRequestsStep } from './resource-requests-step/FormResourceRequestsStep';

export const createProposalSteps: ProposalCreationFormStep[] = [
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
