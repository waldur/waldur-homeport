import { FunctionComponent } from 'react';

import { SharedProviderFilterContainer } from './SharedProviderFilter';
import { SharedProviderTabsContainer } from './SharedProviderTabs';

export const SharedProviderContainer: FunctionComponent = () => {
  return (
    <>
      <SharedProviderFilterContainer />
      <SharedProviderTabsContainer />
    </>
  );
};
