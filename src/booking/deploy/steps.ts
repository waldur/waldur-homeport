import { translate } from '@waldur/i18n';
import { FormFinalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormFinalConfigurationStep';
import { FormPlanStep } from '@waldur/marketplace/deploy/steps/FormPlanStep';
import { FormProjectStep } from '@waldur/marketplace/deploy/steps/FormProjectStep';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

import { FormPeriodsStep } from './FormPeriodsStep';

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
    required: true,
    requiredFields: ['plan'],
    component: FormPlanStep,
  },
  {
    label: translate('Periods'),
    id: 'step-periods',
    fields: ['attributes.schedules'],
    required: true,
    requiredFields: ['attributes.schedules'],
    component: FormPeriodsStep,
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
