import { ENV } from '@waldur/core/config';
import { VStepperFormStep } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { Call } from '@waldur/proposals/types';

import { ProjectDetailsStep } from './ProjectDetailsStep';
import { ProposalComplianceStepExpanded } from './ProposalComplianceStepExpanded';
import { ProposalDetailsOverviewStep } from './ProposalDetailsOverviewStep';
import { ProposalTeamStep } from './ProposalTeamStep';
import { FormResourceRequestsStep } from './resource-requests-step/FormResourceRequestsStep';

const isCodeRequired = ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;

export const createProposalSteps = (call?: Call): VStepperFormStep[] => {
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
        'project_has_civilian_purpose',
        'oecd_fos_2007_code',
        'project_is_confidential',
        'duration_in_days',
        'supporting_documentation',
      ],
      required: true,
      requiredFields: [
        'name',
        'project_summary',
        isCodeRequired ? 'oecd_fos_2007_code' : null,
        'duration_in_days',
      ].filter(Boolean),
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

  // Conditionally add compliance step if call has compliance checklist AND experimental UI is enabled
  if (call?.compliance_checklist && isExperimentalUiComponentsVisible()) {
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
