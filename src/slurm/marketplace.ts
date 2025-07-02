import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';
import { SLURM_PLUGIN, SITE_AGENT_PLUGIN } from '@waldur/slurm/constants';

const UserPluginOptionsForm = lazyComponent(() =>
  import('@waldur/marketplace/UserPluginOptionsForm').then((module) => ({
    default: module.UserPluginOptionsForm,
  })),
);

const UserSecretOptionsForm = lazyComponent(() =>
  import('@waldur/marketplace/UserSecretOptionsForm').then((module) => ({
    default: module.UserSecretOptionsForm,
  })),
);

const SlurmOrderForm = lazyComponent(() =>
  import('./deploy/SlurmOrderForm').then((module) => ({
    default: module.SlurmOrderForm,
  })),
);

export const SlurmOffering: OfferingConfiguration = {
  type: SLURM_PLUGIN,
  get label() {
    return translate('SLURM allocation');
  },
  orderFormComponent: SlurmOrderForm,
  providerType: 'SLURM',
  allowToUpdateService: true,
};

export const SiteAgentOffering: OfferingConfiguration = {
  type: SITE_AGENT_PLUGIN,
  get label() {
    return translate('Waldur site agent');
  },
  orderFormComponent: SlurmOrderForm,
  pluginOptionsForm: UserPluginOptionsForm,
  secretOptionsForm: UserSecretOptionsForm,
  showComponents: true,
};
