import { getLatinNameValidators, max } from '@/core/validators';
import { translate } from '@/i18n';
import {
  DetailsOverviewStep,
  FinalConfigurationStep,
  PlanStep,
} from '@/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@/marketplace/deploy/types';

import { FormInternalNetworkStep } from './FormInternalNetworkStep';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  DetailsOverviewStep,
  PlanStep,
  {
    label: translate('Internal network'),
    id: 'step-internal-network',
    fields: ['attributes.subnet_cidr', 'attributes.subnet_allocation_pool'],
    required: false,
    component: FormInternalNetworkStep,
  },
  {
    ...FinalConfigurationStep,
    params: {
      nameLabel: translate('Tenant name'),
      nameValidate: getLatinNameValidators().concat(max(64)),
    },
  },
];
