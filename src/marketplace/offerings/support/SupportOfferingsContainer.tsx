import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useAdminItems } from '@waldur/navigation/navitems';
import { useTitle } from '@waldur/navigation/title';

import { SupportOfferingsFilter } from './SupportOfferingsFilter';
import { SupportOfferingsList } from './SupportOfferingsList';

export const SupportOfferingsContainer: FunctionComponent = () => {
  useTitle(translate('Offerings'));
  useAdminItems();
  return <SupportOfferingsList filters={<SupportOfferingsFilter />} />;
};
