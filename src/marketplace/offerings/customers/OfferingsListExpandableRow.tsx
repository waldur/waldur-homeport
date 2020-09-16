import * as React from 'react';

import { CustomersList } from '@waldur/marketplace/offerings/customers/CustomersList';
import { CustomersListFilter } from '@waldur/marketplace/offerings/customers/CustomersListFilter';
import { OfferingCostsChart } from '@waldur/marketplace/offerings/customers/OfferingCostsChart';

export const OfferingsListExpandableRow = ({ row }) => (
  <>
    <CustomersListFilter />
    <div className="ibox-content">
      <CustomersList offeringUuid={row.uuid} />
    </div>
    <OfferingCostsChart offeringUuid={row.uuid} />
  </>
);
