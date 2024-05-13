import {
  UIView,
  useRouter,
  StateDeclaration,
  useCurrentStateAndParams,
} from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { CustomerProfile } from '@waldur/customer/dashboard/CustomerProfile';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ORGNIZATION_MENU_EXCLUDE_STATES } from '@waldur/navigation/constants';
import { usePageHero } from '@waldur/navigation/context';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import {
  checkIsServiceManager,
  getCustomer,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

const getDashboardState = (state: StateDeclaration) => {
  if (isDescendantOf('organization', state)) {
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
  const { state } = useCurrentStateAndParams();
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

  const hideHero = ORGNIZATION_MENU_EXCLUDE_STATES.some(
    (name) => state.name.includes(name) || String(state.parent).includes(name),
  );

  const showRoleSelector = showCallManagement || showServiceProvider;

  if (hideHero) {
    return null;
  }

  const dashboardState = getDashboardState(router.globals.current);

  return (
    <div className="container-fluid mb-8 mt-6">
      {showRoleSelector && (
        <Tabs
          defaultActiveKey={dashboardState}
          className="nav-line-tabs mb-4"
          onSelect={goTo}
        >
          <Tab
            eventKey="organization.dashboard"
            title={translate('Customer')}
          ></Tab>
          {showCallManagement && (
            <Tab
              eventKey="call-management.dashboard"
              title={translate('Call management')}
            ></Tab>
          )}
          {showServiceProvider && (
            <Tab
              eventKey="marketplace-provider-dashboard"
              title={translate('Service provider')}
            ></Tab>
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

export const OrganizationUIView: FunctionComponent = () => {
  const customer = useSelector(getCustomer);

  usePageHero(<PageHero customer={customer} />);

  return <UIView />;
};