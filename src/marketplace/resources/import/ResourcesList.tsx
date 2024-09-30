import { FunctionComponent, useMemo } from 'react';

import { requiredArray } from '@waldur/core/validators';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { ImportableResource, Offering } from '@waldur/marketplace/types';
import { ResourceIcon } from '@waldur/resource/ResourceName';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

const serializeResource = (resource) => ({
  name: resource.name,
  uuid: resource.backend_id,
  resource_type: resource.type,
});

const NameField = ({ row }) =>
  row.type ? <ResourceIcon resource={serializeResource(row)} /> : row.name;

export const ResourcesList: FunctionComponent<{
  offering: Offering;
  plans;
  assignPlan;
  categoryUuid?: string;
}> = ({ offering, plans, assignPlan, categoryUuid }) => {
  const filter = useMemo(
    () => ({ category_uuid: categoryUuid }),
    [categoryUuid],
  );

  const tableProps = useTable({
    table: 'offeringImportableResources',
    fetchData: createFetcher(
      `marketplace-provider-offerings/${offering.uuid}/importable_resources`,
    ),
    filter,
    queryField: 'name',
  });

  return (
    <Table<ImportableResource>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: NameField,
          orderField: 'name',
        },
        {
          title: translate('Type'),
          render: ({ row }) => row.type,
        },
        {
          title: translate('Backend ID'),
          render: ({ row }) => row.backend_id,
        },
        {
          title: translate('Plan'),
          render: ({ row }) => (
            <Select
              placeholder={translate('Plan')}
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              options={offering.plans}
              value={plans[row.backend_id]}
              onChange={(plan) => assignPlan(row, plan)}
              isClearable={false}
            />
          ),
          className: 'min-w-150px',
          disabledClick: true,
        },
      ]}
      title={translate('Resources')}
      verboseName={translate('Resources')}
      rowKey="backend_id"
      hasQuery
      fieldType="checkbox"
      fieldName="resources"
      validate={[requiredArray]}
    />
  );
};
