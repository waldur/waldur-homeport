import { getLatinNameValidators, max } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormFinalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormFinalConfigurationStep';
import { FormPlanStep } from '@waldur/marketplace/deploy/steps/FormPlanStep';
import { FormProjectStep } from '@waldur/marketplace/deploy/steps/FormProjectStep';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

import { FormInternalNetworkStep } from './FormInternalNetworkStep';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  {
    label: translate('Project'),
    id: 'step-project',
    fields: ['project'],
    required: true,
    requiredFields: ['project'],
    component: FormProjectStep,
  },
  {
    label: translate('Plan'),
    id: 'step-plan',
    fields: ['plan'],
    required: true,
    requiredFields: ['plan'],
    component: FormPlanStep,
  },
  {
    label: translate('Internal network'),
    id: 'step-internal-network',
    fields: ['attributes.subnet_cidr', 'attributes.subnet_allocation_pool'],
    required: false,
    component: FormInternalNetworkStep,
  },
  {
    label: translate('Final configuration'),
    id: 'step-final-configuration',
    fields: ['attributes.name', 'attributes.description'],
    required: true,
    requiredFields: ['attributes.name'],
    component: FormFinalConfigurationStep,
    params: {
      nameLabel: translate('Tenant name'),
      nameValidate: getLatinNameValidators().concat(max(64)),
    },
  },
];
