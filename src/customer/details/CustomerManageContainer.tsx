import { UIView } from '@uirouter/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { canRegisterServiceProviderForCustomer } from '@waldur/marketplace/service-providers/selectors';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/utils';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser, isStaff } from '@waldur/workspace/selectors';

const CustomerDetailsPanel = lazyComponent(
  () => import('./CustomerDetailsPanel'),
  'CustomerDetailsPanel',
);
const CustomerContactPanel = lazyComponent(
  () => import('./CustomerContactPanel'),
  'CustomerContactPanel',
);
const CustomerAccessControlPanel = lazyComponent(
  () => import('./CustomerAccessControlPanel'),
  'CustomerAccessControlPanel',
);
const CustomerBillingPanel = lazyComponent(
  () => import('./CustomerBillingPanel'),
  'CustomerBillingPanel',
);
const CustomerCallManagerPanel = lazyComponent(
  () => import('./CustomerCallManagerPanel'),
  'CustomerCallManagerPanel',
);
const CustomerMarketplacePanel = lazyComponent(
  () => import('./CustomerMarketplacePanel'),
  'CustomerMarketplacePanel',
);
const CustomerRemovePanel = lazyComponent(
  () => import('./CustomerRemovePanel'),
  'CustomerRemovePanel',
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
        <Component {...props} key={key} tabSpec={tabSpec} />
      )}
    />
  );
};
