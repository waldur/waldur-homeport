import { FunctionComponent } from 'react';

import { useCustomerItems } from '@waldur/customer/utils';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { MyOfferingsList } from './MyOfferingsList';
import { OfferingsFilter as MyOfferingsFilter } from './OfferingsFilter';

export const MyOfferingsListContainer: FunctionComponent = () => {
  useTitle(translate('My offerings'));
  useCustomerItems();
  return <MyOfferingsList filters={<MyOfferingsFilter />} />;
};
