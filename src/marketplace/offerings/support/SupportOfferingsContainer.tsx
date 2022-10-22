import { FunctionComponent } from 'react';

import { SupportOfferingsFilter } from './SupportOfferingsFilter';
import { SupportOfferingsList } from './SupportOfferingsList';

export const SupportOfferingsContainer: FunctionComponent = () => {
  return <SupportOfferingsList filters={<SupportOfferingsFilter />} />;
};
