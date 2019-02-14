import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { PlanUsageFilter } from './PlanUsageFilter';
import { PlanUsageList } from './PlanUsageList';

const PlanUsageContainer = () => (
  <div className="ibox-content">
    <PlanUsageFilter/>
    <PlanUsageList/>
  </div>
);

export default connectAngularComponent(PlanUsageContainer);
