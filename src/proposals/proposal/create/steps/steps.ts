import { translate } from '@waldur/i18n';
import { ProposalCreationFormStep } from '@waldur/proposals/types';

import { FormProjectDetailsStep } from './FormProjectDetailsStep';
import { FormResourceRequestsStep } from './FormResourceRequestsStep';
import { FormTeamStep } from './FormTeamStep';
import { FormUserAgreementsStep } from './FormUserAgreementsStep';

export const createProposalSteps: ProposalCreationFormStep[] = [
  {
    label: translate('Project details'),
    id: 'step-project',
    component: FormProjectDetailsStep,
  },
  {
    label: translate('Team'),
    id: 'step-team',
    component: FormTeamStep,
  },
  {
    label: translate('Resource requests'),
    id: 'step-resource-requests',
    component: FormResourceRequestsStep,
  },
  {
    label: translate('User agreements'),
    id: 'step-user-agreements',
    component: FormUserAgreementsStep,
  },
];
