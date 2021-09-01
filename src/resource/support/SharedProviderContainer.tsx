import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { SharedProviderFilterContainer } from './SharedProviderFilter';
import { SharedProviderTabsContainer } from './SharedProviderTabs';

export const SharedProviderContainer: FunctionComponent = () => {
  useTitle(translate('Shared providers'));
  const router = useRouter();
  if (!ENV.FEATURES.SUPPORT.CUSTOMERS_LIST) {
    router.stateService.go('errorPage.notFound');
  }
  return (
    <>
      <SharedProviderFilterContainer />
      <SharedProviderTabsContainer />
    </>
  );
};
