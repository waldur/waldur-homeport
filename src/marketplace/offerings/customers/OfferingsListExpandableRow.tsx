import * as React from 'react';

import { CUSTOMERS_LIST_FILTER } from '@waldur/marketplace/offerings/customers/constants';
import { CustomersList } from '@waldur/marketplace/offerings/customers/CustomersList';
import { CustomersListFilter } from '@waldur/marketplace/offerings/customers/CustomersListFilter';
import { OfferingCostsChart } from '@waldur/marketplace/offerings/customers/OfferingCostsChart';

export const OfferingsListExpandableRow = ({ row }) => {
  const [uniqueFormId] = React.useState(`${CUSTOMERS_LIST_FILTER}-${row.uuid}`);
  return (
    <>
      <CustomersListFilter uniqueFormId={uniqueFormId} />
      <div className="ibox-content">
        <CustomersList offeringUuid={row.uuid} uniqueFormId={uniqueFormId} />
      </div>
      <OfferingCostsChart offeringUuid={row.uuid} uniqueFormId={uniqueFormId} />
    </>
  );
};
