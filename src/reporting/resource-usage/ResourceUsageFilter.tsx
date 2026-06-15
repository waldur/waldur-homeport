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
  const customer = values?.organization;

  return (
    <>
      <AccountingPeriodFilter options={options} />
      <OrganizationFilter />
      <ProjectFilter customer_uuid={customer ? customer.uuid : null} />
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
