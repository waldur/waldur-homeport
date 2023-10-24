import { translate } from '@waldur/i18n';
import { FormAdditionalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormAdditionalConfigurationStep';
import { FormFinalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormFinalConfigurationStep';
import { FormPlanStep } from '@waldur/marketplace/deploy/steps/FormPlanStep';
import { FormProjectStep } from '@waldur/marketplace/deploy/steps/FormProjectStep';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

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
    label: translate('Additional configuration'),
    id: 'step-additional-configuration',
    required: false,
    component: FormAdditionalConfigurationStep,
    isActive: (offering) => {
      return offering.options.order?.length > 0;
    },
  },
  {
    label: translate('Final configuration'),
    id: 'step-final-configuration',
    fields: ['attributes.name', 'attributes.description'],
    required: true,
    requiredFields: ['attributes.name'],
    component: FormFinalConfigurationStep,
  },
];
