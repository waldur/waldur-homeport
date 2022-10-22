import { FunctionComponent } from 'react';

import { VmOverviewFilterContainer } from './VmOverviewFilterContainer';
import { VmTypeOverview } from './VmTypeOverview';

export const VmTypeOverviewContainer: FunctionComponent = () => {
  return (
    <>
      <VmOverviewFilterContainer />
      <VmTypeOverview />
    </>
  );
};
