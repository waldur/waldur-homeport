import { useCurrentStateAndParams } from '@uirouter/react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { useMarketplacePublicTabs } from '../utils';

import { PublicOfferingsList } from './PublicOfferingsList';

export const AllOfferingsList = () => {
  const {
    params: { initialMode },
  } = useCurrentStateAndParams();

  useTitle(translate('All offerings'));
  useMarketplacePublicTabs();
  return <PublicOfferingsList showCategory initialMode={initialMode} />;
};
