import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { GrowthChart } from '@waldur/invoices/growth/GrowthChart';
import { GrowthFilter } from '@waldur/invoices/growth/GrowthFilter';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { useTitle } from '@waldur/navigation/title';

export const GrowthContainer: FunctionComponent = () => {
  useTitle(translate('Growth'));
  useReportingBreadcrumbs();
  return (
    <>
      <GrowthFilter />
      <GrowthChart />
    </>
  );
};
