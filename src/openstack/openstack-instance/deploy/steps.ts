import { translate } from '@waldur/i18n';
import { FormCloudStep } from '@waldur/marketplace/deploy/steps/FormCloudStep';
import { FormFinalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormFinalConfigurationStep';
import { FormProjectStep } from '@waldur/marketplace/deploy/steps/FormProjectStep';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

import { FormDataVolumeStep } from './FormDataVolumeStep';
import { FormFlavorStep } from './FormFlavorStep';
import { FormImageStep } from './FormImageStep';
import { FormNetworkStep } from './FormNetworkStep';
import { FormSecurityGroupsStep } from './FormSecurityGroupsStep';
import { FormSSHPublicKeysStep } from './FormSSHPublicKeysStep';
import { FormStartupScriptStep } from './FormStartupScriptStep';
import { FormSystemVolumeStep } from './FormSystemVolumeStep';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  {
    label: translate('Project'),
    id: 'step-project',
    required: true,
    requiredFields: ['project'],
    component: FormProjectStep,
  },
  {
    label: translate('Cloud region'),
    id: 'step-cloud-region',
    required: true,
    requiredFields: ['offering'],
    component: FormCloudStep,
  },
  {
    label: translate('Image'),
    id: 'step-image',
    required: true,
    requiredFields: ['attributes.image'],
    component: FormImageStep,
  },
  {
    label: translate('Flavor'),
    id: 'step-flavor',
    required: true,
    requiredFields: ['attributes.flavor'],
    component: FormFlavorStep,
  },
  {
    label: translate('System volume'),
    id: 'step-system-volume',
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
    required: false,
    component: FormDataVolumeStep,
  },
  {
    label: translate('SSH public key'),
    id: 'step-ssh-public-key',
    required: false,
    component: FormSSHPublicKeysStep,
  },
  {
    label: translate('Network'),
    id: 'step-network',
    required: false,
    component: FormNetworkStep,
  },
  {
    label: translate('Security groups'),
    id: 'step-security-groups',
    required: false,
    component: FormSecurityGroupsStep,
  },
  {
    label: translate('Startup script'),
    id: 'step-startup-script',
    required: false,
    component: FormStartupScriptStep,
  },
  {
    label: translate('Final configuration'),
    id: 'step-final-configuration',
    required: true,
    requiredFields: ['attributes.name'],
    component: FormFinalConfigurationStep,
  },
];
