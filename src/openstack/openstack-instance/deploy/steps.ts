import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import {
  CustomerStep,
  ProjectStep,
} from '@waldur/marketplace/deploy/steps/constants';
import { FormCloudStep } from '@waldur/marketplace/deploy/steps/FormCloudStep';
import { FormFinalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormFinalConfigurationStep';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';
import { INSTANCE_TYPE } from '@waldur/openstack/constants';

import { validateOpenstackInstanceName } from '../utils';

import { FormDataVolumeStep } from './FormDataVolumeStep';
import { FormFlavorStep } from './FormFlavorStep';
import { FormImageStep } from './FormImageStep';
import { FormNetworkStep } from './FormNetworkStep';
import { FormSecurityGroupsStep } from './FormSecurityGroupsStep';
import { FormSSHPublicKeysStep } from './FormSSHPublicKeysStep';
import { FormStartupScriptStep } from './FormStartupScriptStep';
import { FormSystemVolumeStep } from './FormSystemVolumeStep';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  CustomerStep,
  ProjectStep,
  {
    label: translate('Cloud region'),
    id: 'step-cloud-region',
    fields: ['offering'],
    required: true,
    requiredFields: ['offering'],
    component: FormCloudStep,
    params: { type: INSTANCE_TYPE },
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
    label: translate('Flavor'),
    id: 'step-flavor',
    fields: ['attributes.flavor'],
    required: true,
    requiredFields: ['attributes.flavor'],
    component: FormFlavorStep,
  },
  {
    label: translate('System volume'),
    id: 'step-system-volume',
    fields: ['attributes.system_volume_type', 'attributes.system_volume_size'],
    required: true,
    requiredFields: [
      'attributes.system_volume_type',
      'attributes.system_volume_size',
    ],
    component: FormSystemVolumeStep,
  },
  {
    label: translate('Data volume'),
    id: 'step-data-volume',
    fields: ['attributes.data_volume_type', 'attributes.data_volume_size'],
    required: false,
    component: FormDataVolumeStep,
  },
  {
    label: translate('SSH public key'),
    id: 'step-ssh-public-key',
    fields: ['attributes.ssh_public_key'],
    required: false,
    component: FormSSHPublicKeysStep,
  },
  {
    label: translate('Network'),
    id: 'step-network',
    fields: ['attributes.networks'],
    required: false,
    component: FormNetworkStep,
  },
  {
    label: translate('Security groups'),
    id: 'step-security-groups',
    fields: ['attributes.security_groups'],
    required: false,
    component: FormSecurityGroupsStep,
  },
  {
    label: translate('Startup script'),
    id: 'step-startup-script',
    fields: ['startup_script'],
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
