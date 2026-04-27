import { sqlServerName } from '@/azure/common/validators';
import { required } from '@/core/validators';
import { translate } from '@/i18n';
import {
  DetailsOverviewStep,
  FinalConfigurationStep,
  PlanStep,
} from '@/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@/marketplace/deploy/types';

import { FormLocationStep } from './FormLocationStep';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  DetailsOverviewStep,
  PlanStep,
  {
    label: translate('Location'),
    id: 'step-location',
    fields: ['attributes.location'],
    required: true,
    requiredFields: ['attributes.location'],
    component: FormLocationStep,
  },
  {
    ...FinalConfigurationStep,
    params: {
      nameValidate: [required, sqlServerName],
      nameLabel: translate('SQL server name'),
      descriptionLabel: translate('SQL server description'),
    },
  },
];
