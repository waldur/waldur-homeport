import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { VmOverviewFilterContainer } from './VmOverviewFilterContainer';
import { VmTypeOverview } from './VmTypeOverview';

export const VmTypeOverviewContainer: FunctionComponent = () => {
  useTitle(translate('VM type overview'));
  useReportBreadcrumbs({
    category: 'infrastructure',
    currentReport: 'vm-overview',
  });

  return (
    <>
      <VmOverviewFilterContainer />
      <VmTypeOverview />
    </>
  );
};
