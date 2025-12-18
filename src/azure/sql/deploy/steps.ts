import { sqlServerName } from '@waldur/azure/common/validators';
import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import {
  DetailsOverviewStep,
  FinalConfigurationStep,
  PlanStep,
} from '@waldur/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

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
