import { FunctionComponent } from 'react';

import { MyOfferingsList } from './MyOfferingsList';
import { OfferingsFilter as MyOfferingsFilter } from './OfferingsFilter';

export const MyOfferingsListContainer: FunctionComponent = () => {
  return <MyOfferingsList filters={<MyOfferingsFilter />} />;
};
