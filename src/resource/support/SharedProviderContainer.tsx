import * as React from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { SharedProviderFilterContainer } from './SharedProviderFilter';
import { SharedProviderTabsContainer } from './SharedProviderTabs';

export const SharedProviderContainer = () => {
  useTitle(translate('Shared providers'));
  return (
    <>
      <SharedProviderFilterContainer />
      <SharedProviderTabsContainer />
    </>
  );
};
