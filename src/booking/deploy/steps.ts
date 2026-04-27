import { translate } from '@/i18n';
import {
  DetailsOverviewStep,
  FinalConfigurationStep,
  PlanStep,
} from '@/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@/marketplace/deploy/types';

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
