import * as React from 'react';

import { MyOfferingsList } from './MyOfferingsList';
import { OfferingsFilter as MyOfferingsFilter } from './OfferingsFilter';

export const MyOfferingsListContainer = () => (
  <div className="ibox-content">
    <MyOfferingsFilter />
    <MyOfferingsList />
  </div>
);
