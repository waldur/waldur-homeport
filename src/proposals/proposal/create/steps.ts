import { ENV } from '@waldur/configs/default';
import { VStepperFormStep } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';

import { ProjectDetailsStep } from './ProjectDetailsStep';
import { FormResourceRequestsStep } from './resource-requests-step/FormResourceRequestsStep';

const isCodeRequired = ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;

export const createProposalSteps: VStepperFormStep[] = [
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
    fields: ['resources'],
    required: true,
    requiredFields: ['resources'],
  },
];
