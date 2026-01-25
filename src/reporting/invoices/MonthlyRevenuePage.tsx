import { FC } from 'react';

import { CustomerListContainer } from '@waldur/customer/list/CustomerListContainer';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

export const MonthlyRevenuePage: FC = () => {
  useTitle(translate('Monthly revenue'));
  useReportBreadcrumbs({
    category: 'financial',
    currentReport: 'monthly-revenue',
  });

  return <CustomerListContainer />;
};
