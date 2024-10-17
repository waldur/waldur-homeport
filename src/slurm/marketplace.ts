import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { SLURM_PLUGIN, SLURM_REMOTE_PLUGIN } from '@waldur/slurm/constants';

const UserPluginOptionsForm = lazyComponent(
  () => import('@waldur/marketplace/UserPluginOptionsForm'),
  'UserPluginOptionsForm',
);

const UserSecretOptionsForm = lazyComponent(
  () => import('@waldur/marketplace/UserSecretOptionsForm'),
  'UserSecretOptionsForm',
);

const SlurmOrderForm = lazyComponent(
  () => import('./deploy/SlurmOrderForm'),
  'SlurmOrderForm',
);

registerOfferingType({
  type: SLURM_PLUGIN,
  get label() {
    return translate('SLURM allocation');
  },
  orderFormComponent: SlurmOrderForm,
  providerType: 'SLURM',
  allowToUpdateService: true,
});

registerOfferingType({
  type: SLURM_REMOTE_PLUGIN,
  get label() {
    return translate('SLURM remote allocation');
  },
  orderFormComponent: SlurmOrderForm,
  pluginOptionsForm: UserPluginOptionsForm,
  secretOptionsForm: UserSecretOptionsForm,
  providerType: 'SLURM remote',
  allowToUpdateService: true,
});
