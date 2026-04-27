import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';

import { SITE_AGENT_PLUGIN } from './constants';

const SiteAgentCredentialsForm = lazyComponent(() =>
  import('./SiteAgentCredentialsForm').then((module) => ({
    default: module.SiteAgentCredentialsForm,
  })),
);

const UserPluginOptionsForm = lazyComponent(() =>
  import('@/marketplace/UserPluginOptionsForm').then((module) => ({
    default: module.UserPluginOptionsForm,
  })),
);

const UserSecretOptionsForm = lazyComponent(() =>
  import('@/marketplace/UserSecretOptionsForm').then((module) => ({
    default: module.UserSecretOptionsForm,
  })),
);

const SiteAgentOrderForm = lazyComponent(() =>
  import('./SiteAgentOrderForm').then((module) => ({
    default: module.SiteAgentOrderForm,
  })),
);

export const SiteAgentOffering: OfferingConfiguration = {
  type: SITE_AGENT_PLUGIN,
  get label() {
    return translate('Waldur site agent');
  },
  orderFormComponent: SiteAgentOrderForm,
  pluginOptionsForm: UserPluginOptionsForm,
  secretOptionsForm: UserSecretOptionsForm,
  showComponents: true,
  credentialsForm: SiteAgentCredentialsForm,
};
