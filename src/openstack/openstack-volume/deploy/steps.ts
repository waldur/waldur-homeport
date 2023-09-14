import { translate } from '@waldur/i18n';
import { FormCloudStep } from '@waldur/marketplace/deploy/steps/FormCloudStep';
import { FormFinalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormFinalConfigurationStep';
import { FormProjectStep } from '@waldur/marketplace/deploy/steps/FormProjectStep';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';
import { VOLUME_TYPE } from '@waldur/openstack/constants';

import { FormVolumeStep } from './FormVolumeStep';

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
    label: translate('Cloud region'),
    id: 'step-cloud-region',
    fields: ['offering'],
    required: true,
    requiredFields: ['offering'],
    component: FormCloudStep,
    params: { type: VOLUME_TYPE },
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
    label: translate('Final configuration'),
    id: 'step-final-configuration',
    fields: ['attributes.name', 'attributes.description'],
    required: true,
    requiredFields: ['attributes.name'],
    component: FormFinalConfigurationStep,
    params: { nameLabel: translate('Volume name') },
  },
];
