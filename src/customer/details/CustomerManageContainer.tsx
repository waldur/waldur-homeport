import { UIView } from '@uirouter/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { canRegisterServiceProviderForCustomer } from '@waldur/marketplace/service-providers/selectors';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser, isStaff } from '@waldur/workspace/selectors';

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
const CustomerAccessControlPanel = lazyComponent(() =>
  import('./CustomerAccessControlPanel').then((module) => ({
    default: module.CustomerAccessControlPanel,
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

export const CustomerManageContainer = () => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isUserStaff = useSelector(isStaff);
  const canRegisterServiceProvider = useSelector(
    canRegisterServiceProviderForCustomer,
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
          component: CustomerAccessControlPanel,
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
        hasPermission(user, {
          permission: PermissionEnum.DELETE_CUSTOMER,
          customerId: customer.uuid,
        })
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
