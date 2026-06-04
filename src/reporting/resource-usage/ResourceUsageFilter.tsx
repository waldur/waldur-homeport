import { FunctionComponent } from 'react';
import { useFormState } from 'react-final-form';

import { AccountingPeriodFilter } from '@/customer/list/AccountingPeriodFilter';
import { makeLastTwelveMonthsFilterPeriods } from '@/form/utils';
import { OfferingFilter } from '@/marketplace/offerings/details/OfferingFilter';
import { OrganizationFilter } from '@/marketplace/orders/OrganizationFilter';
import { ProjectFilter } from '@/marketplace/resources/list/ProjectFilter';
import { ResourceFilter } from '@/resource/ResourceFilter';

export const FORM_ID = 'ResourceUsageFilter';

const options = makeLastTwelveMonthsFilterPeriods();

export const ResourceUsageFilter: FunctionComponent = () => {
  const { values } = useFormState();
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
