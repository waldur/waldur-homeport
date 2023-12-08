import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { Attribute } from '@waldur/marketplace/types';
import { SLURM_PLUGIN, SLURM_REMOTE_PLUGIN } from '@waldur/slurm/constants';

import { deployOfferingSteps } from './deploy/steps';

const UserPluginOptionsForm = lazyComponent(
  () => import('@waldur/marketplace/UserPluginOptionsForm'),
  'UserPluginOptionsForm',
);

const UserSecretOptionsForm = lazyComponent(
  () => import('@waldur/marketplace/UserSecretOptionsForm'),
  'UserSecretOptionsForm',
);

const ServiceSettingsAttributes = (): Attribute[] => [
  {
    key: 'hostname',
    title: translate('Hostname'),
    type: 'string',
  },
  {
    key: 'username',
    title: translate('Username'),
    type: 'string',
  },
  {
    key: 'port',
    title: translate('Port'),
    type: 'string',
  },
  {
    key: 'gateway',
    title: translate('Gateway'),
    type: 'string',
  },
  {
    key: 'use_sudo',
    title: translate('Use sudo'),
    type: 'string',
  },
  {
    key: 'default_account',
    title: translate('Default account'),
    type: 'string',
  },
];

registerOfferingType({
  type: SLURM_PLUGIN,
  get label() {
    return translate('SLURM allocation');
  },
  formSteps: deployOfferingSteps,
  providerType: 'SLURM',
  attributes: ServiceSettingsAttributes,
  allowToUpdateService: true,
});

registerOfferingType({
  type: SLURM_REMOTE_PLUGIN,
  get label() {
    return translate('SLURM remote allocation');
  },
  formSteps: deployOfferingSteps,
  pluginOptionsForm: UserPluginOptionsForm,
  secretOptionsForm: UserSecretOptionsForm,
  providerType: 'SLURM remote',
  attributes: (): Attribute[] => [],
  allowToUpdateService: true,
});
