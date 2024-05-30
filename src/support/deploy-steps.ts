import { translate } from '@waldur/i18n';
import {
  CustomerStep,
  PlanStep,
  ProjectStep,
} from '@waldur/marketplace/deploy/steps/constants';
import { FormAdditionalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormAdditionalConfigurationStep';
import { FormFinalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormFinalConfigurationStep';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  CustomerStep,
  ProjectStep,
  PlanStep,
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
    fields: [
      'attributes.name',
      'attributes.description',
      'attributes.end_date',
    ],
    required: true,
    requiredFields: ['attributes.name'],
    component: FormFinalConfigurationStep,
  },
];
