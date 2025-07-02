import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { DetailsOverviewStep } from '@waldur/marketplace/deploy/steps/constants';
import { FormCloudStep } from '@waldur/marketplace/deploy/steps/FormCloudStep';
import { FormFinalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormFinalConfigurationStep';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';
import { INSTANCE_TYPE } from '@waldur/openstack/constants';

import { validateOpenstackInstanceName } from '../utils';

import { FormHardwareConfigurationStep } from './FormHardwareConfigurationStep';
import { FormImageStep } from './FormImageStep';
import { FormNetworkSecurityStep } from './FormNetworkSecurityStep';
import { FormStartupScriptStep } from './FormStartupScriptStep';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  DetailsOverviewStep,
  {
    label: translate('Cloud region'),
    id: 'step-cloud-region',
    fields: ['offering'],
    required: true,
    requiredFields: ['offering'],
    component: FormCloudStep,
    params: { type: INSTANCE_TYPE },
    isActive: (offering) => offering.shared,
  },
  {
    label: translate('Image'),
    id: 'step-image',
    fields: ['attributes.image'],
    required: true,
    requiredFields: ['attributes.image'],
    component: FormImageStep,
  },
  {
    label: translate('Hardware configuration'),
    id: 'step-hardware',
    fields: [
      'attributes.flavor',
      'attributes.system_volume_type',
      'attributes.system_volume_size',
      'attributes.data_volume_type',
      'attributes.data_volume_size',
    ],
    required: true,
    requiredFields: [
      'attributes.flavor',
      'attributes.system_volume_type',
      'attributes.system_volume_size',
    ],
    component: FormHardwareConfigurationStep,
  },
  {
    label: translate('Network and security'),
    id: 'step-network-security',
    fields: [
      'attributes.ssh_public_key',
      'attributes.networks',
      'attributes.security_groups',
    ],
    required: false,
    component: FormNetworkSecurityStep,
  },
  {
    label: translate('Automation'),
    id: 'step-startup-script',
    fields: ['attributes.user_data'],
    required: false,
    component: FormStartupScriptStep,
  },
  {
    label: translate('Final configuration'),
    id: 'step-final-configuration',
    fields: ['attributes.name', 'attributes.description'],
    required: true,
    requiredFields: ['attributes.name'],
    component: FormFinalConfigurationStep,
    params: {
      nameLabel: translate('VM name'),
      nameValidate: [required, validateOpenstackInstanceName],
    },
  },
];
