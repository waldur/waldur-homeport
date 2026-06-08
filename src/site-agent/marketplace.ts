import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';

import { SITE_AGENT_PLUGIN } from './constants';

const DefaultUserManagementSection = lazyComponent(() =>
  import('@/marketplace/offerings/update/integration/UserManagementSection').then(
    (module) => ({
      default: module.DefaultUserManagementSection,
    }),
  ),
);

const SiteAgentOrderForm = lazyComponent(() =>
  import('./SiteAgentOrderForm').then((module) => ({
    default: module.SiteAgentOrderForm,
  })),
);

const SiteAgentCredentialsSection = lazyComponent(() =>
  import('./SiteAgentCredentialsSection').then((module) => ({
    default: module.SiteAgentCredentialsSection,
  })),
);

export const SiteAgentOffering: OfferingConfiguration = {
  type: SITE_AGENT_PLUGIN,
  get label() {
    return translate('Waldur site agent');
  },
  orderFormComponent: SiteAgentOrderForm,
  userManagementSection: DefaultUserManagementSection,
  showComponents: true,
  credentialsSection: SiteAgentCredentialsSection,
};
