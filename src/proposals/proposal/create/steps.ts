import { translate } from '@/i18n';
import { Call, ProposalFieldConfig } from '@/proposals/types';
import { VStepperFormStep } from '@/wizard';

import { ProjectDetailsStep } from './ProjectDetailsStep';
import { ProposalComplianceStepExpanded } from './ProposalComplianceStepExpanded';
import { ProposalDetailsOverviewStep } from './ProposalDetailsOverviewStep';
import {
  getFieldStates,
  getRequiredFields,
  getTrackedFields,
} from './proposalFields';
import { ProposalTeamStep } from './ProposalTeamStep';
import { FormResourceRequestsStep } from './resource-requests-step/FormResourceRequestsStep';

export const createProposalSteps = (
  call?: Pick<Call, 'compliance_checklist'> & {
    proposal_field_config?: ProposalFieldConfig;
  },
): VStepperFormStep[] => {
  // Which fields the Project details step asks for, and which of them block
  // submission, is per-call configuration rather than a constant.
  const fieldStates = getFieldStates(call?.proposal_field_config);
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
      // Both lists have to agree with what the step renders: `requiredFields`
      // drives the "n/m filled" count and whether the step can ever report
      // complete, so a field listed here but not rendered parks the applicant
      // on a step with no field left to fill. Both helpers apply the same
      // visibility rules the step does.
      fields: getTrackedFields(fieldStates),
      required: true,
      requiredFields: getRequiredFields(fieldStates),
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
