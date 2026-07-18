import { FunctionComponent, useContext } from 'react';

import { AccountingPeriodFilter } from '@/customer/list/AccountingPeriodFilter';
import { makeLastTwelveMonthsFilterPeriods } from '@/form/utils';
import { OfferingFilter } from '@/marketplace/offerings/details/OfferingFilter';
import { OrganizationFilter } from '@/marketplace/orders/OrganizationFilter';
import { ProjectFilter } from '@/marketplace/resources/list/ProjectFilter';
import { ResourceFilter } from '@/resource/ResourceFilter';
import { TableFilterContext } from '@/table/FilterContextProvider';
import { useFilterValues } from '@/table/useFilterValues';

export const FORM_ID = 'ResourceUsageFilter';

const options = makeLastTwelveMonthsFilterPeriods();

export const ResourceUsageFilter: FunctionComponent = () => {
  const { table } = useContext(TableFilterContext);
  const values = useFilterValues(table);
  // Global staff report: use backend keys so it doesn't pick up the workspace
  // organization/project context (?organization=/?project=).
  const customer = values?.customer_uuid;

  return (
    <>
      <AccountingPeriodFilter options={options} />
      <OrganizationFilter name="customer_uuid" />
      <ProjectFilter
        name="project_uuid"
        customer_uuid={customer ? customer.uuid : null}
      />
      <OfferingFilter
        badgeValue={(value) =>
          value?.category_title
            ? `${value.category_title} / ${value.name}`
            : value?.name
        }
        offeringFilter={{ shared: true }}
      />
      <ResourceFilter />
    </>
  );
};
