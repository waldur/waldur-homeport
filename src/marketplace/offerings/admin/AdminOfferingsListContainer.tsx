import { FunctionComponent } from 'react';

import { AdminOfferingsFilter } from './AdminOfferingsFilter';
import { AdminOfferingsList } from './AdminOfferingsList';

export const AdminOfferingsListContainer: FunctionComponent = () => (
  <AdminOfferingsList filters={<AdminOfferingsFilter />} />
);
