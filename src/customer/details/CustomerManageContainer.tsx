import { UIView } from '@uirouter/react';
import { useMemo } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures, MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { canRegisterServiceProviderForCustomer } from '@/marketplace/service-providers/selectors';
import { PageBarTab } from '@/navigation/types';
import { usePageTabsTransmitter } from '@/navigation/usePageTabsTransmitter';
import { useUser, useCustomer } from '@/workspace/hooks';
import { checkIsOwner } from '@/workspace/selectors';

const CustomerDetailsPanel = lazyComponent(() =>
  import('./CustomerDetailsPanel').then((module) => ({
    default: module.CustomerDetailsPanel,
  })),
);
const CustomerContactPanel = lazyComponent(() =>
  import('./CustomerContactPanel').then((module) => ({
    default: module.CustomerContactPanel,
  })),
);
const AccessControlTabsContainer = lazyComponent(() =>
  import('./AccessControlTabsContainer').then((module) => ({
    default: module.AccessControlTabsContainer,
  })),
);
const CustomerBillingPanel = lazyComponent(() =>
  import('./CustomerBillingPanel').then((module) => ({
    default: module.CustomerBillingPanel,
  })),
);
const CustomerCallManagerPanel = lazyComponent(() =>
  import('./CustomerCallManagerPanel').then((module) => ({
    default: module.CustomerCallManagerPanel,
  })),
);
const CustomerMarketplacePanel = lazyComponent(() =>
  import('./CustomerMarketplacePanel').then((module) => ({
    default: module.CustomerMarketplacePanel,
  })),
);
const CustomerCreditPanel = lazyComponent(() =>
  import('./CustomerCreditPanel').then((module) => ({
    default: module.CustomerCreditPanel,
  })),
);
const CustomerRemovePanel = lazyComponent(() =>
  import('./CustomerRemovePanel').then((module) => ({
    default: module.CustomerRemovePanel,
  })),
);
const ProjectDigestConfigPage = lazyComponent(() =>
  import('../project-digest/ProjectDigestConfigPage').then((module) => ({
    default: module.ProjectDigestConfigPage,
  })),
);

export const CustomerManageContainer = () => {
  const user = useUser();
  const customer = useCustomer();
  const isUserStaff = user?.is_staff;
  const canRegisterServiceProvider = canRegisterServiceProviderForCustomer(
    user,
    customer,
  );
  const userIsOwnerOrStaff = useMemo(
    () => user?.is_staff || checkIsOwner(customer, user),
    [customer, user],
  );

  const tabs = useMemo<PageBarTab[]>(
    () =>
      [
        {
          key: 'basic-details',
          component: CustomerDetailsPanel,
          title: translate('Basic details'),
        },
        {
          key: 'contact',
          component: CustomerContactPanel,
          title: translate('Contact'),
        },
        {
          key: 'access-control',
          component: AccessControlTabsContainer,
          title: translate('Access control'),
        },
        {
          key: 'billing',
          component: CustomerBillingPanel,
          title: translate('Billing'),
        },
        isFeatureVisible(
          MarketplaceFeatures.show_call_management_functionality,
        ) && isUserStaff
          ? {
              key: 'call-manager',
              component: CustomerCallManagerPanel,
              title: translate('Call manager'),
            }
          : null,
        customer.is_service_provider || canRegisterServiceProvider
          ? {
              key: 'service-provider',
              component: CustomerMarketplacePanel,
              title: translate('Service provider'),
            }
          : null,
        customer.credit
          ? {
              key: 'credit',
              component: CustomerCreditPanel,
              title: translate('Credit management'),
            }
          : null,
        userIsOwnerOrStaff &&
        isFeatureVisible(CustomerFeatures.show_project_digest)
          ? {
              key: 'project-digest',
              component: ProjectDigestConfigPage,
              title: translate('Project digest'),
            }
          : null,
        isUserStaff
          ? {
              key: 'remove',
              component: CustomerRemovePanel,
              title: translate('Remove'),
            }
          : null,
      ].filter(Boolean),
    [user, customer, canRegisterServiceProvider],
  );

  const { tabSpec } = usePageTabsTransmitter(tabs);

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component key={key} {...props} tabSpec={tabSpec} />
      )}
    />
  );
};
