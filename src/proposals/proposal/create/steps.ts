import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { VStepperFormStep } from '@/wizard';

import { ProjectDetailsStep } from './ProjectDetailsStep';
import { ProposalComplianceStepExpanded } from './ProposalComplianceStepExpanded';
import { ProposalDetailsOverviewStep } from './ProposalDetailsOverviewStep';
import { ProposalTeamStep } from './ProposalTeamStep';
import { FormResourceRequestsStep } from './resource-requests-step/FormResourceRequestsStep';

export const createProposalSteps = (
  call?: Pick<Call, 'compliance_checklist'>,
): VStepperFormStep[] => {
  const baseSteps: VStepperFormStep[] = [
    {
      label: translate('Details overview'),
      id: 'step-general',
      component: ProposalDetailsOverviewStep,
    },
    {
      label: translate('Project details'),
      id: 'step-project',
      component: ProjectDetailsStep,
      fields: [
        'name',
        'project_summary',
        'description',
        'science_sub_domain',
        'duration_in_days',
        'supporting_documentation',
      ],
      required: true,
      requiredFields: ['name', 'project_summary', 'duration_in_days'],
    },
    {
      label: translate('Resource requests'),
      id: 'step-resource-requests',
      component: FormResourceRequestsStep,
      fields: ['resources', 'resources_init'],
      required: true,
      requiredFields: ['resources_init'], // Use resources_init as it holds actual resource requests
    },
    {
      label: translate('Project team'),
      id: 'step-team',
      component: ProposalTeamStep,
      fields: ['users'],
      required: true,
      requiredFields: ['users'],
    },
  ];

  // Add the compliance step when the call has a compliance checklist.
  if (call?.compliance_checklist) {
    const complianceStep: VStepperFormStep = {
      label: translate('Compliance checklist'),
      id: 'step-compliance',
      component: ProposalComplianceStepExpanded,
      fields: ['compliance_questions'], // Placeholder field for compliance questions
      required: true, // Compliance step completion is validated via backend is_completed status
      requiredFields: [], // Validation handled via backend completion status, not individual fields
    };

    // Insert compliance step after project details, before resource requests
    baseSteps.splice(2, 0, complianceStep);
  }

  return baseSteps;
};
