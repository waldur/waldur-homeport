import * as React from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { MyOfferingsList } from './MyOfferingsList';
import { OfferingsFilter as MyOfferingsFilter } from './OfferingsFilter';

export const MyOfferingsListContainer = () => {
  useTitle(translate('My offerings'));
  return (
    <div className="ibox-content">
      <MyOfferingsFilter />
      <MyOfferingsList />
    </div>
  );
};
