import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Panel } from '@waldur/core/Panel';
import { CustomerBookingManagement } from '@waldur/customer/dashboard/CustomerBookingManagement';
import { CategoryResourcesList } from '@waldur/dashboard/CategoryResourcesList';
import { DashboardHeader } from '@waldur/dashboard/DashboardHeader';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { CustomerChecklistOverview } from '@waldur/marketplace-checklist/CustomerChecklistOverview';
import { useTitle } from '@waldur/navigation/title';
import {
  getUser,
  getCustomer,
  checkIsServiceManager,
} from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { CustomerDashboardChart } from './CustomerDashboardChart';
import { CustomerResourcesList } from './CustomerResourcesList';

export const CustomerDashboard: FunctionComponent = () => {
  useTitle(translate('Dashboard'));

  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isServiceManager = useMemo(
    () => checkIsServiceManager(customer, user),
    [customer, user],
  );

  return (
    <>
      <DashboardHeader
        title={translate('Welcome, {user}!', { user: user.full_name })}
        subtitle={translate('Overview of {organization} organization', {
          organization: customer.name,
        })}
      />
      {isServiceManager ? (
        <CustomerBookingManagement />
      ) : (
        <>
          <CustomerDashboardChart customer={customer} user={user} />
          <CustomerChecklistOverview customer={customer} />
          <CustomerBookingManagement />
          <Panel title={translate('Resources')}>
            <CustomerResourcesList />
          </Panel>
          {isFeatureVisible('customer.dashboard.category-resources-list') && (
            <CategoryResourcesList
              scopeType={ORGANIZATION_WORKSPACE}
              scope={customer}
            />
          )}
        </>
      )}
    </>
  );
};
