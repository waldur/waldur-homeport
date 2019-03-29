import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { SharedProviderFilterContainer } from './SharedProviderFilter';
import { SharedProviderTabsContainer } from './SharedProviderTabs';

export const SharedProviderContainer = () => (
  <>
    <SharedProviderFilterContainer/>
    <SharedProviderTabsContainer/>
  </>
);

export default connectAngularComponent(SharedProviderContainer);
