import * as React from 'react';

import { VmOverviewFilterContainer } from './VmOverviewFilterContainer';
import { VmTypeOverview } from './VmTypeOverview';

export const VmTypeOverviewContainer = () => (
  <>
    <VmOverviewFilterContainer />
    <VmTypeOverview />
  </>
);
