import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { ProjectsList } from '@waldur/project/ProjectsList';
import {
  checkIsServiceManager,
  getCustomer,
  getUser,
  isOwnerOrStaff,
} from '@waldur/workspace/selectors';

import { CustomerDashboardChart } from './CustomerDashboardChart';
import { CustomerProfile } from './CustomerProfile';

export const CustomerDashboard: FunctionComponent = () => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isServiceManager = useMemo(
    () => checkIsServiceManager(customer, user),
    [customer, user],
  );
  const canSeeCharts = useSelector(isOwnerOrStaff);

  if (!customer) return null;

  return (
    <>
      {isServiceManager ? (
        <CustomerProfile customer={customer} />
      ) : (
        <>
          {canSeeCharts && (
            <CustomerDashboardChart customer={customer} user={user} />
          )}
          <div className="mb-6">
            <ProjectsList />
          </div>
        </>
      )}
    </>
  );
};
