import { virtualMachineName } from '@waldur/azure/common/validators';
import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import {
  DetailsOverviewStep,
  FinalConfigurationStep,
  PlanStep,
} from '@waldur/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

import { FormHardwareStep } from './FormHardwareStep';
import { FormLocationStep } from './FormLocationStep';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  DetailsOverviewStep,
  PlanStep,
  {
    label: translate('Location'),
    id: 'step-location',
    fields: ['attributes.location', 'attributes.availability_zone'],
    required: true,
    requiredFields: ['attributes.location', 'attributes.availability_zone'],
    component: FormLocationStep,
  },
  {
    label: translate('Hardware configuration'),
    id: 'step-hardware',
    fields: ['attributes.image', 'attributes.size'],
    required: true,
    requiredFields: ['attributes.image', 'attributes.size'],
    component: FormHardwareStep,
  },
  {
    ...FinalConfigurationStep,
    params: {
      nameValidate: [required, virtualMachineName],
      descriptionLabel: translate('Description'),
      formatSuggestedName: (name: string) => name.substring(0, 15),
    },
  },
];
