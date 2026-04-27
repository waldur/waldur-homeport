import { translate } from '@/i18n';
import {
  DetailsOverviewStep,
  FinalConfigurationStep,
} from '@/marketplace/deploy/steps/constants';
import { FormCloudStep } from '@/marketplace/deploy/steps/FormCloudStep';
import { OfferingConfigurationFormStep } from '@/marketplace/deploy/types';
import { VOLUME_TYPE } from '@/openstack/constants';
import { getVolumeNameValidators } from '@/openstack/utils';

import { FormVolumeStep } from './FormVolumeStep';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  DetailsOverviewStep,
  {
    label: translate('Cloud region'),
    id: 'step-cloud-region',
    fields: ['offering'],
    required: true,
    requiredFields: ['offering'],
    component: FormCloudStep,
    params: { type: VOLUME_TYPE },
    isActive: (offering) => offering.shared,
  },
  {
    label: translate('Volume'),
    id: 'step-volume',
    fields: ['attributes.type', 'attributes.size'],
    required: true,
    requiredFields: ['attributes.type', 'attributes.size'],
    component: FormVolumeStep,
  },
  {
    ...FinalConfigurationStep,
    params: {
      nameLabel: translate('Volume name'),
      nameValidate: getVolumeNameValidators(),
    },
  },
];
