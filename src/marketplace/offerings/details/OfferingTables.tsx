import { useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { OfferingOrderItemsList } from '@waldur/marketplace/details/OfferingOrderItemsList';
import { OfferingResourcesFilter } from '@waldur/marketplace/details/OfferingResourcesFilter';
import { OfferingResourcesList } from '@waldur/marketplace/details/OfferingResourcesList';
import { OrderItemsFilter } from '@waldur/marketplace/orders/item/list/OrderItemsFilter';

import { OFFERING_CUSTOMERS_LIST_FILTER } from '../expandable/constants';
import { OfferingCostsChart } from '../expandable/OfferingCostsChart';
import { OfferingCustomersList } from '../expandable/OfferingCustomersList';
import { OfferingCustomersListFilter } from '../expandable/OfferingCustomersListFilter';
import { OfferingUsageChart } from '../expandable/OfferingUsageChart';

import { OfferingBookingTab } from './OfferingBookingTab';
import { OfferingUsersTable } from './OfferingUsersTable';
import { OfferingPermissionsList } from './permissions/OfferingPermissionsList';

export const OfferingTables = ({ offering }) => {
  const [uniqueFormId] = useMemo(
    () => `${OFFERING_CUSTOMERS_LIST_FILTER}-${offering.uuid}`,
    [offering],
  );
  return (
    <>
      <div className="mb-10">
        <OfferingOrderItemsList
          offering={offering}
          filters={<OrderItemsFilter />}
        />
      </div>
      <div className="mb-10">
        <OfferingResourcesList
          offering={offering}
          filters={<OfferingResourcesFilter />}
        />
      </div>
      <div className="mb-10">
        <OfferingUsersTable offering={offering} />
      </div>
      <div className="mb-10">
        <OfferingPermissionsList offering={offering} />
      </div>
      <div className="mb-10">
        <OfferingCustomersListFilter uniqueFormId={uniqueFormId} />
      </div>
      <div className="mb-10">
        <OfferingCustomersList
          offeringUuid={offering.uuid}
          uniqueFormId={uniqueFormId}
        />
      </div>
      <Card className="mb-10">
        <div className="border-2 border-bottom card-header">
          <div className="card-toolbar">
            <div className="card-title h5">
              {translate('Offering cost chart')}
            </div>
          </div>
        </div>
        <OfferingCostsChart
          offeringUuid={offering.uuid}
          uniqueFormId={uniqueFormId}
        />
      </Card>
      {offering.components.length > 0 ? (
        <Card className="mb-10">
          <div className="border-2 border-bottom card-header">
            <div className="card-toolbar">
              <div className="card-title h5">
                {translate('Component usage chart')}
              </div>
            </div>
          </div>
          <OfferingUsageChart
            offeringUuid={offering.uuid}
            components={offering.components}
          />
        </Card>
      ) : null}
      {offering.type === OFFERING_TYPE_BOOKING && (
        <OfferingBookingTab offeringUuid={offering.uuid} />
      )}
    </>
  );
};
