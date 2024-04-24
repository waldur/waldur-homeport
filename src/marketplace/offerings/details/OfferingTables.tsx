import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { OfferingBookingResourcesCalendarContainer } from '@waldur/booking/offering/OfferingBookingResourcesCalendarContainer';
import { translate } from '@waldur/i18n';
import { OfferingOrdersList } from '@waldur/marketplace/details/OfferingOrdersList';
import { OfferingResourcesList } from '@waldur/marketplace/details/OfferingResourcesList';
import { Offering } from '@waldur/marketplace/types';
import { PlanUsageRow } from '@waldur/reporting/plan-usage/types';

import { OFFERING_CUSTOMERS_LIST_FILTER } from '../expandable/constants';
import { OfferingCostsChart } from '../expandable/OfferingCostsChart';
import { OfferingCustomersList } from '../expandable/OfferingCustomersList';
import { OfferingCustomersListFilter } from '../expandable/OfferingCustomersListFilter';
import { OfferingEventsList } from '../expandable/OfferingEventsList';
import { OfferingUsageChart } from '../expandable/OfferingUsageChart';

import { OfferingUsersTable } from './OfferingUsersTable';
import { OfferingPermissionsList } from './permissions/OfferingPermissionsList';
import { PlanUsageList } from './PlanUsageList';

interface OfferingTablesProps {
  offering: Offering;
  plansUsage: PlanUsageRow[];
}

export const OfferingTables: FC<OfferingTablesProps> = ({
  offering,
  plansUsage,
}) => {
  const [uniqueFormId] = useMemo(
    () => `${OFFERING_CUSTOMERS_LIST_FILTER}-${offering.uuid}`,
    [offering],
  );
  return (
    <>
      {offering.type === OFFERING_TYPE_BOOKING && (
        <div className="mb-10">
          <OfferingBookingResourcesCalendarContainer
            offeringUuid={offering.uuid}
          />
        </div>
      )}
      <div className="mb-10" id="orders">
        <OfferingOrdersList offering={offering} />
      </div>
      <div className="mb-10" id="resources">
        <OfferingResourcesList offering={offering} />
      </div>
      {offering.type !== OFFERING_TYPE_BOOKING && offering.billable && (
        <PlanUsageList plansUsage={plansUsage} className="mb-10" id="plans" />
      )}
      <div className="mb-10" id="users">
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
      <OfferingEventsList offering={offering} />
    </>
  );
};
