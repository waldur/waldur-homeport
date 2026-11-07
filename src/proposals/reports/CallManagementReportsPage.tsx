import { useMemo } from 'react';

import { useCustomer } from '@/workspace/hooks';

import { ReportsPage } from './ReportsPage';

/** The Reports tab of an organization's call management. */
export const CallManagementReportsPage = () => {
  const customer = useCustomer();
  const scope = useMemo(
    () => ({ organizationUuid: customer.call_managing_organization_uuid }),
    [customer.call_managing_organization_uuid],
  );
  return <ReportsPage scope={scope} />;
};
