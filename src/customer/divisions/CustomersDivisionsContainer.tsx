import { FunctionComponent } from 'react';

import { CustomersDivisionsChart } from '@waldur/customer/divisions/CustomersDivisionsChart';
import { CustomersDivisionsFilter } from '@waldur/customer/divisions/CustomersDivisionsFilter';
import { translate } from '@waldur/i18n';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { useTitle } from '@waldur/navigation/title';

export const CustomersDivisionsContainer: FunctionComponent = () => {
  useTitle(translate('Organizations divisions'));
  useReportingBreadcrumbs();
  return (
    <>
      <CustomersDivisionsFilter />
      <CustomersDivisionsChart />
    </>
  );
};
