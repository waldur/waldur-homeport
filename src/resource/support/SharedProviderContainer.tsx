import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useSupportItems } from '@waldur/navigation/navitems';
import { useTitle } from '@waldur/navigation/title';

import { SharedProviderFilterContainer } from './SharedProviderFilter';
import { SharedProviderTabsContainer } from './SharedProviderTabs';

export const SharedProviderContainer: FunctionComponent = () => {
  useTitle(translate('Shared providers'));
  useSupportItems();
  return (
    <>
      <SharedProviderFilterContainer />
      <SharedProviderTabsContainer />
    </>
  );
};
