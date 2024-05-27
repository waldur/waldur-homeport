import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { useMarketplacePublicTabs } from '../utils';

import { PublicOfferingsList } from './PublicOfferingsList';

export const AllOfferingsList = () => {
  useTitle(translate('All offerings'));
  useMarketplacePublicTabs();
  return <PublicOfferingsList showCategory />;
};
