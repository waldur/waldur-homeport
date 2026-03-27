import { FunctionComponent } from 'react';

import { ReportingTitle } from '../../ReportingTitle';

import { VmOverviewFilterContainer } from './VmOverviewFilterContainer';
import { VmTypeOverview } from './VmTypeOverview';

export const VmTypeOverviewContainer: FunctionComponent = () => {
  return (
    <>
      <ReportingTitle reportKey="vm-type-overview">
        <VmOverviewFilterContainer />
      </ReportingTitle>
      <VmTypeOverview />
    </>
  );
};
