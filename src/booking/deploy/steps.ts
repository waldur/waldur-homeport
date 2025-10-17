import { translate } from '@waldur/i18n';
import {
  DetailsOverviewStep,
  FinalConfigurationStep,
  PlanStep,
} from '@waldur/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

import { FormPeriodsStep } from './FormPeriodsStep';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  DetailsOverviewStep,
  PlanStep,
  {
    label: translate('Periods'),
    id: 'step-periods',
    fields: ['attributes.schedules'],
    required: true,
    requiredFields: ['attributes.schedules'],
    component: FormPeriodsStep,
  },
  FinalConfigurationStep,
];
