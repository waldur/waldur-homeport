import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { MyOfferingsList } from './MyOfferingsList';
import { OfferingsFilter as MyOfferingsFilter } from './OfferingsFilter';

const MyOfferingsListContainer = () => (
  <div className="ibox-content">
    <MyOfferingsFilter/>
    <MyOfferingsList/>
  </div>
);

export default connectAngularComponent(MyOfferingsListContainer);
