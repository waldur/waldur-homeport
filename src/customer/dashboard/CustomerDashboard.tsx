import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { CategoryResourcesList } from '@waldur/dashboard/CategoryResourcesList';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures } from '@waldur/FeaturesEnums';
import { CustomerChecklistOverview } from '@waldur/marketplace-checklist/CustomerChecklistOverview';
import { ProjectsList } from '@waldur/project/ProjectsList';
import {
  getUser,
  getCustomer,
  checkIsServiceManager,
} from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

import { CustomerDashboardChart } from './CustomerDashboardChart';
import { CustomerProfile } from './CustomerProfile';

export const CustomerDashboard: FunctionComponent = () => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isServiceManager = useMemo(
    () => checkIsServiceManager(customer, user),
    [customer, user],
  );

  if (!customer) return null;

  return (
    <>
      {isServiceManager ? (
        <CustomerProfile customer={customer} />
      ) : (
        <>
          <CustomerProfile customer={customer} />
          <CustomerDashboardChart customer={customer} user={user} />
          <CustomerChecklistOverview customer={customer} />
          <div className="mb-6">
            <ProjectsList />
          </div>
          {isFeatureVisible(CustomerFeatures.category_resources_list) && (
            <CategoryResourcesList
              scopeType={WorkspaceType.ORGANIZATION}
              scope={customer}
            />
          )}
        </>
      )}
    </>
  );
};
