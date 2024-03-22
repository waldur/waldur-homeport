import { FC } from 'react';
import { useSelector } from 'react-redux';

import { CallManagementProfile } from '@waldur/proposals/call-management/CallManagementProfile';
import { getCustomer } from '@waldur/workspace/selectors';

import { CallManagementStatistics } from './CallManagementStatistics';

export const CallManagementDashboard: FC = () => {
  const customer = useSelector(getCustomer);
  return (
    <>
      <CallManagementProfile customer={customer} />
      <CallManagementStatistics />
    </>
  );
};
