import { getLatinNameValidators } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import {
  CustomerStep,
  PlanStep,
  ProjectStep,
} from '@waldur/marketplace/deploy/steps/constants';
import { FormFinalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormFinalConfigurationStep';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  CustomerStep,
  ProjectStep,
  PlanStep,
  {
    label: translate('Final configuration'),
    id: 'step-final-configuration',
    fields: ['attributes.name', 'attributes.description'],
    required: true,
    requiredFields: ['attributes.name'],
    component: FormFinalConfigurationStep,
    params: {
      nameLabel: translate('Allocation name'),
      nameValidate: getLatinNameValidators(),
    },
  },
];
