import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';

import { SITE_AGENT_PLUGIN } from './constants';

const SiteAgentCredentialsForm = lazyComponent(() =>
  import('./SiteAgentCredentialsForm').then((module) => ({
    default: module.SiteAgentCredentialsForm,
  })),
);

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
