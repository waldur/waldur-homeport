import { FunctionComponent, useContext } from 'react';

import { AccountingPeriodFilter } from '@/customer/list/AccountingPeriodFilter';
import { makeLastTwelveMonthsFilterPeriods } from '@/form/utils';
import { translate } from '@/i18n';
import { OfferingFilter } from '@/marketplace/offerings/details/OfferingFilter';
import { OrganizationFilter } from '@/marketplace/orders/OrganizationFilter';
import { ProjectFilter } from '@/marketplace/resources/list/ProjectFilter';
import { getMissingUsagePolicyChoices } from '@/marketplace/resources/usage/missingUsagePolicy';
import { ResourceFilter } from '@/resource/ResourceFilter';
import { SelectFilter } from '@/table';
import { TableFilterContext } from '@/table/FilterContextProvider';
import { useFilterValues } from '@/table/useFilterValues';

export const FORM_ID = 'ResourceUsageFilter';

interface MissingUsagePolicyOption {
  label: string;
  value: string;
}

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
      <SelectFilter
        title={translate('Missing usage policy')}
        name="missing_usage_policy"
        getValueLabel={(value: MissingUsagePolicyOption) => value?.label}
        placeholder={translate('Missing usage policy')}
        options={getMissingUsagePolicyChoices()}
        getOptionValue={(option: MissingUsagePolicyOption) => option.value}
        getOptionLabel={(option: MissingUsagePolicyOption) => option.label}
        isClearable={true}
        isMulti={true}
      />
    </>
  );
};
