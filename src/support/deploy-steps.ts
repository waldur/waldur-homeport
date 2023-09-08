import { translate } from '@waldur/i18n';
import { FormFinalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormFinalConfigurationStep';
import { FormPlanStep } from '@waldur/marketplace/deploy/steps/FormPlanStep';
import { FormProjectStep } from '@waldur/marketplace/deploy/steps/FormProjectStep';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  {
    label: translate('Project'),
    id: 'step-project',
    required: true,
    requiredFields: ['project'],
    component: FormProjectStep,
  },
  {
    label: translate('Plan'),
    id: 'step-plan',
    required: true,
    requiredFields: ['plan'],
    component: FormPlanStep,
  },
  {
    label: translate('Final configuration'),
    id: 'step-final-configuration',
    required: true,
    requiredFields: ['attributes.name'],
    component: FormFinalConfigurationStep,
  },
];
