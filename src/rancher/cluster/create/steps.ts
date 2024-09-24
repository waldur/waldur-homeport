import { ENV } from '@waldur/configs/default';
import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import {
  CustomerStep,
  PlanStep,
  ProjectStep,
} from '@waldur/marketplace/deploy/steps/constants';
import { FormCloudStep } from '@waldur/marketplace/deploy/steps/FormCloudStep';
import { FormFinalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormFinalConfigurationStep';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';
import { FormSSHPublicKeysStep } from '@waldur/openstack/openstack-instance/deploy/FormSSHPublicKeysStep';

import { MARKETPLACE_RANCHER } from './constants';
import { FormDataStorageStep } from './FormDataStorageStep';
import { FormNetworkStep } from './FormNetworkStep';
import { FormNodesStep } from './FormNodesStep';
import { FormOptionalServicesStep } from './FormOptionalServicesStep';
import { FormRancherSecurityGroupsStep } from './FormRancherSecurityGroupsStep';
import { FormSystemStorageStep } from './FormSystemStorageStep';
import { FormTenantStep } from './FormTenantStep';
import { getRancherMountPointChoices, rancherClusterName } from './utils';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  CustomerStep,
  ProjectStep,
  PlanStep,
  {
    label: translate('Management offering'),
    id: 'step-management-offering',
    fields: ['offering'],
    required: true,
    requiredFields: ['offering'],
    component: FormCloudStep,
    params: { type: MARKETPLACE_RANCHER },
  },
  {
    label: translate('Tenant'),
    id: 'step-tenant',
    fields: ['attributes.tenant'],
    required: true,
    requiredFields: ['attributes.tenant'],
    component: FormTenantStep,
  },
  {
    label: translate('Nodes'),
    id: 'step-nodes',
    fields: ['attributes.nodes'],
    required: true,
    requiredFields: ['attributes.nodes'],
    component: FormNodesStep,
  },
  {
    label: translate('System storage'),
    id: 'step-system-storage',
    fields: ['attributes.system_volume_type', 'attributes.system_volume_size'],
    required: true,
    component: FormSystemStorageStep,
  },
  {
    label: translate('Data storage'),
    id: 'step-data-storage',
    fields: ['attributes.data_volume_type', 'attributes.data_volume_size'],
    required: false,
    component: FormDataStorageStep,
    isActive: () =>
      getRancherMountPointChoices().length > 0 &&
      !ENV.plugins.WALDUR_RANCHER.DISABLE_DATA_VOLUME_CREATION,
  },
  {
    label: translate('SSH public key'),
    id: 'step-ssh-public-key',
    fields: ['attributes.ssh_public_key'],
    required: false,
    component: FormSSHPublicKeysStep,
    isActive: () => !ENV.plugins.WALDUR_RANCHER.DISABLE_SSH_KEY_INJECTION,
  },
  {
    label: translate('Network'),
    id: 'step-network',
    fields: ['attributes.subnet'],
    required: true,
    requiredFields: ['attributes.subnet'],
    component: FormNetworkStep,
  },
  {
    label: translate('Security groups'),
    id: 'step-security-groups',
    fields: ['attributes.security_groups'],
    required: false,
    component: FormRancherSecurityGroupsStep,
  },
  {
    label: translate('Optional'),
    id: 'step-optional-services',
    fields: ['attributes.install_longhorn'],
    required: false,
    component: FormOptionalServicesStep,
  },
  {
    label: translate('Final configuration'),
    id: 'step-final-configuration',
    fields: ['attributes.name', 'attributes.description'],
    required: true,
    requiredFields: ['attributes.name'],
    component: FormFinalConfigurationStep,
    params: {
      nameLabel: translate('Cluster name'),
      nameValidate: [required, rancherClusterName],
    },
  },
];
