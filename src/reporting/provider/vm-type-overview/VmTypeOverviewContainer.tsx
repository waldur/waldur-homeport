import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../../ReportsBreadcrumbs';

import { VmOverviewFilterContainer } from './VmOverviewFilterContainer';
import { VmTypeOverview } from './VmTypeOverview';

export const VmTypeOverviewContainer: FunctionComponent = () => {
  useTitle(translate('VM type overview'));
  useReportBreadcrumbs({
    category: 'provider',
    currentReport: 'vm-type-overview',
  });

  return (
    <>
      <div className="table-standalone-header d-flex justify-content-between gap-4 mb-6">
        <h1 className="mb-0 fs-1x">{translate('VM type overview')}</h1>
        <div className="d-none d-sm-flex gap-4">
          <VmOverviewFilterContainer />
        </div>
      </div>
      <VmTypeOverview />
    </>
  );
};
