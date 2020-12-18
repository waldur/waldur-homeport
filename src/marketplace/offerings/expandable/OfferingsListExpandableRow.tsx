import { useState } from 'react';

import { OFFERING_CUSTOMERS_LIST_FILTER } from './constants';
import { OfferingCostsChart } from './OfferingCostsChart';
import { OfferingCustomersList } from './OfferingCustomersList';
import { OfferingCustomersListFilter } from './OfferingCustomersListFilter';

export const OfferingsListExpandableRow = ({ row }) => {
  const [uniqueFormId] = useState(
    `${OFFERING_CUSTOMERS_LIST_FILTER}-${row.uuid}`,
  );
  return (
    <>
      <OfferingCustomersListFilter uniqueFormId={uniqueFormId} />
      <div className="ibox-content">
        <OfferingCustomersList
          offeringUuid={row.uuid}
          uniqueFormId={uniqueFormId}
        />
      </div>
      <OfferingCostsChart offeringUuid={row.uuid} uniqueFormId={uniqueFormId} />
    </>
  );
};
