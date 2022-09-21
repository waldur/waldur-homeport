import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { CustomerBookingManagement } from '@waldur/customer/dashboard/CustomerBookingManagement';
import { CategoryResourcesList } from '@waldur/dashboard/CategoryResourcesList';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { CustomerChecklistOverview } from '@waldur/marketplace-checklist/CustomerChecklistOverview';
import { useTitle } from '@waldur/navigation/title';
import { ProjectsListOnly } from '@waldur/project/ProjectsList';
import {
  getUser,
  getCustomer,
  checkIsServiceManager,
} from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { CustomerDashboardChart } from './CustomerDashboardChart';
import { CustomerProfile } from './CustomerProfile';

export const CustomerDashboard: FunctionComponent = () => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isServiceManager = useMemo(
    () => checkIsServiceManager(customer, user),
    [customer, user],
  );

  useTitle(
    translate('Profile'),
    translate('Organization') + ': ' + customer.display_name,
  );

  return (
    <>
      {isServiceManager ? (
        <CustomerBookingManagement />
      ) : (
        <>
          <CustomerProfile customer={customer} />
          <CustomerDashboardChart customer={customer} user={user} />
          <CustomerChecklistOverview customer={customer} />
          <CustomerBookingManagement />
          <div className="mb-6">
            <ProjectsListOnly />
          </div>
          {isFeatureVisible('customer.category_resources_list') && (
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
