import {
  StateDeclaration,
  UIView,
  useCurrentStateAndParams,
  useRouter,
} from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { CustomerProfile } from '@/customer/dashboard/CustomerProfile';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { hasProviderRouting } from '@/issues/hooks';
import { useBreadcrumbs, usePageHero } from '@/navigation/context';
import { usePresetBreadcrumbItems } from '@/navigation/header/breadcrumb/utils';
import { IBreadcrumbItem } from '@/navigation/types';
import { isDescendantOf } from '@/navigation/useTabs';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser, useCustomer } from '@/workspace/hooks';
import {
  checkIsServiceManager,
  checkIsOwnerOrStaff,
} from '@/workspace/selectors';

const getDashboardState = (state: StateDeclaration) => {
  if (state.name === 'organization-manage') {
    return state.name;
  } else if (isDescendantOf('organization', state)) {
    return 'organization.dashboard';
  } else if (isDescendantOf('call-management', state)) {
    return 'call-management.dashboard';
  } else if (isDescendantOf('marketplace-provider', state)) {
    return 'marketplace-provider-dashboard';
  } else if (isDescendantOf('provider-helpdesk', state)) {
    return 'provider-helpdesk-overview';
  }
  return '';
};

const PageHero = ({ customer }) => {
  const router = useRouter();
  const goTo = (state) =>
    router.stateService.go(state, { uuid: customer.uuid });

  const user = useUser();
  const isOwnerOrStaff = checkIsOwnerOrStaff(customer, user);

  const showCallManagement =
    customer?.call_managing_organization_uuid &&
    isFeatureVisible(MarketplaceFeatures.show_call_management_functionality);

  const showServiceProvider =
    customer?.is_service_provider &&
    (checkIsServiceManager(customer, user) || isOwnerOrStaff);

  // Helpdesk is a distinct support-agent domain; surface it as its own mode once
  // a helpdesk is configured. Support-agent-only visibility (a support user with
  // no org role) needs a backend membership flag and is a follow-up; for now
  // owners/service-managers/staff/support see it.
  const showHelpdesk =
    hasProviderRouting() &&
    customer?.has_active_helpdesk &&
    (isOwnerOrStaff ||
      checkIsServiceManager(customer, user) ||
      user?.is_support);

  const canViewCustomerManagement =
    // Can update customer details
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_CUSTOMER,
      customerId: customer.uuid,
    }) ||
    // Can view/manage access control
    hasPermission(user, {
      permission: PermissionEnum.LIST_CUSTOMER_USERS,
      customerId: customer.uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.CREATE_ACCESS_SUBNET,
      customerId: customer.uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_ACCESS_SUBNET,
      customerId: customer.uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.DELETE_ACCESS_SUBNET,
      customerId: customer.uuid,
    }) ||
    // Can register service provider
    hasPermission(user, {
      permission: PermissionEnum.REGISTER_SERVICE_PROVIDER,
      customerId: customer.uuid,
    }) ||
    // Is staff or support (can access call manager and remove)
    user?.is_staff ||
    user?.is_support;

  const showTabs =
    showCallManagement ||
    showServiceProvider ||
    showHelpdesk ||
    canViewCustomerManagement;

  const dashboardState = getDashboardState(router.globals.current);

  return (
    <div className="container-fluid my-5">
      {showTabs && (
        <Tabs
          defaultActiveKey={dashboardState}
          className="nav-line-tabs mb-4"
          onSelect={goTo}
        >
          <Tab
            eventKey="organization.dashboard"
            title={translate('Customer')}
            data-testid="organization-tab-customer"
          />

          {showCallManagement && (
            <Tab
              eventKey="call-management.dashboard"
              title={translate('Call management')}
              data-testid="organization-tab-call-management"
            />
          )}
          {showServiceProvider && (
            <Tab
              eventKey="marketplace-provider-dashboard"
              title={translate('Service provider')}
              data-testid="organization-tab-service-provider"
            />
          )}
          {showHelpdesk && (
            <Tab
              eventKey="provider-helpdesk-overview"
              title={translate('Helpdesk')}
              data-testid="organization-tab-helpdesk"
            />
          )}
          {canViewCustomerManagement && (
            <Tab
              eventKey="organization-manage"
              title={translate('Edit')}
              data-testid="organization-tab-edit"
            />
          )}
        </Tabs>
      )}
      <CustomerProfile
        customer={customer}
        fromServiceProvider={
          dashboardState === 'marketplace-provider-dashboard'
        }
      />
    </div>
  );
};

const WithHero = (props) => {
  const customer = useCustomer();

  if (!customer) {
    return null;
  }

  usePageHero(<PageHero customer={customer} />);

  const { getOrganizationsBreadcrumbItem } = usePresetBreadcrumbItems();

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(
    () => [
      getOrganizationsBreadcrumbItem(),
      {
        key: 'organization',
        text: customer?.name || '',
        active: true,
      },
    ],

    [customer],
  );
  useBreadcrumbs(breadcrumbItems);

  return <UIView {...props} />;
};

export const OrganizationUIView: FunctionComponent = (props) => {
  const { state } = useCurrentStateAndParams();

  if (state.data?.skipHero) {
    return <UIView {...props} />;
  }
  return <WithHero {...props} />;
};
