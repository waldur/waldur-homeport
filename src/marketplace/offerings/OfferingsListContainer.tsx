import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { OfferingsFilter } from './OfferingsFilter';
import { OfferingsList } from './OfferingsList';

const OfferingsListContainer = () => (
  <div className="ibox-content">
    <OfferingsFilter/>
    <OfferingsList/>
  </div>
);

export default connectAngularComponent(OfferingsListContainer);
