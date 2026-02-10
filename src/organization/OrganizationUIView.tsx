import {
  StateDeclaration,
  UIView,
  useCurrentStateAndParams,
  useRouter,
} from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { CustomerProfile } from '@waldur/customer/dashboard/CustomerProfile';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import {
  checkIsServiceManager,
  getCustomer,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

const getDashboardState = (state: StateDeclaration) => {
  if (state.name === 'organization-manage') {
    return state.name;
  } else if (isDescendantOf('organization', state)) {
    return 'organization.dashboard';
  } else if (isDescendantOf('call-management', state)) {
    return 'call-management.dashboard';
  } else if (isDescendantOf('marketplace-provider', state)) {
    return 'marketplace-provider-dashboard';
  }
  return '';
};

const PageHero = ({ customer }) => {
  const router = useRouter();
  const goTo = (state) =>
    router.stateService.go(state, { uuid: customer.uuid });

  const user = useSelector(getUser);
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);

  const showCallManagement =
    customer?.call_managing_organization_uuid &&
    isFeatureVisible(MarketplaceFeatures.show_call_management_functionality);

  const showServiceProvider =
    customer?.is_service_provider &&
    (checkIsServiceManager(customer, user) || isOwnerOrStaff);

  const canViewCustomerManagement =
    // Can update customer details
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_CUSTOMER,
      customerId: customer.uuid,
    }) ||
    // Can update customer contact details
    hasPermission(user, {
      permission: PermissionEnum.CUSTOMER_CONTACT_UPDATE,
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
    showCallManagement || showServiceProvider || canViewCustomerManagement;

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
          />

          {showCallManagement && (
            <Tab
              eventKey="call-management.dashboard"
              title={translate('Call management')}
            />
          )}
          {showServiceProvider && (
            <Tab
              eventKey="marketplace-provider-dashboard"
              title={translate('Service provider')}
            />
          )}
          {canViewCustomerManagement && (
            <Tab eventKey="organization-manage" title={translate('Edit')} />
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
  const customer = useSelector(getCustomer);

  if (!customer) {
    return null;
  }

  usePageHero(<PageHero customer={customer} />);

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(
    () => [
      {
        key: 'organizations',
        text: translate('Organizations'),
        to: 'organizations',
      },
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
