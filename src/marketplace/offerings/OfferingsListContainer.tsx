import { FunctionComponent } from 'react';

import { OfferingsFilter } from './OfferingsFilter';
import { OfferingsList } from './OfferingsList';

export const OfferingsListContainer: FunctionComponent = () => (
  <OfferingsList filters={<OfferingsFilter />} />
);
