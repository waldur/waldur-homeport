import { useCurrentStateAndParams } from '@uirouter/react';

import { useMarketplacePublicTabs } from '../utils';

import { PublicOfferingsList } from './PublicOfferingsList';

export const AllOfferingsList = () => {
  const {
    params: { initialMode },
  } = useCurrentStateAndParams();

  useMarketplacePublicTabs();
  return <PublicOfferingsList showCategory initialMode={initialMode} />;
};
