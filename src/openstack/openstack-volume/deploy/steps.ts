import { translate } from '@waldur/i18n';
import {
  DetailsOverviewStep,
  FinalConfigurationStep,
} from '@waldur/marketplace/deploy/steps/constants';
import { FormCloudStep } from '@waldur/marketplace/deploy/steps/FormCloudStep';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';
import { VOLUME_TYPE } from '@waldur/openstack/constants';
import { getVolumeNameValidators } from '@waldur/openstack/utils';

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
