import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { SupportUsageFilter } from './SupportUsageFilter';
import { SupportUsageList } from './SupportUsageList';

const SupportUsageContainer = () => (
  <div className="ibox-content">
    <SupportUsageFilter/>
    <SupportUsageList/>
  </div>
);

export default connectAngularComponent(SupportUsageContainer);
