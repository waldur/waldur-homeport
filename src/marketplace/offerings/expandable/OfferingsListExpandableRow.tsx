import { useState, FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { OfferingUsageChart } from '@waldur/marketplace/offerings/expandable/OfferingUsageChart';
import { Offering } from '@waldur/marketplace/types';

import { OFFERING_CUSTOMERS_LIST_FILTER } from './constants';
import { OfferingCostsChart } from './OfferingCostsChart';
import { OfferingCustomersList } from './OfferingCustomersList';
import { OfferingCustomersListFilter } from './OfferingCustomersListFilter';

export const OfferingsListExpandableRow: FunctionComponent<{
  row: Offering;
}> = ({ row }) => {
  const [uniqueFormId] = useState(
    `${OFFERING_CUSTOMERS_LIST_FILTER}-${row.uuid}`,
  );
  return (
    <>
      <OfferingCustomersListFilter uniqueFormId={uniqueFormId} />
      <Card.Body>
        <OfferingCustomersList
          offeringUuid={row.uuid}
          uniqueFormId={uniqueFormId}
        />
      </Card.Body>
      <OfferingCostsChart offeringUuid={row.uuid} uniqueFormId={uniqueFormId} />
      {row.components.length > 0 ? (
        <OfferingUsageChart
          offeringUuid={row.uuid}
          components={row.components}
        />
      ) : null}
    </>
  );
};
