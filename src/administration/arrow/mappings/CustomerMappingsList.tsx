import { FunctionComponent, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  adminArrowCustomerMappingsList,
  ArrowCustomerMapping,
  AdminArrowCustomerMappingsListData,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { ARROW_FORM_NAMES } from '../constants';

import { CustomerMappingActions } from './CustomerMappingActions';
import { CustomerMappingCreateButton } from './CustomerMappingCreateButton';
import { CustomerMappingExpandableRow } from './CustomerMappingExpandableRow';
import { CustomerMappingsBulkDeleteAction } from './CustomerMappingsBulkDeleteAction';
import { CustomerMappingsFilter } from './CustomerMappingsFilter';

const filtersSelector = createSelector(
  getFormValues(ARROW_FORM_NAMES.customerMappingsFilter),
  (filterValues: any) => {
    const result: AdminArrowCustomerMappingsListData['query'] = {};
    if (filterValues?.organization) {
      result.waldur_customer_uuid = filterValues.organization.uuid;
    }
    if (filterValues?.arrow_reference) {
      result.arrow_reference = filterValues.arrow_reference;
    }
    return result;
  },
);

const mandatoryFields: Array<keyof ArrowCustomerMapping> = [
  'uuid',
  'arrow_reference',
  'arrow_company_name',
  'waldur_customer',
  'waldur_customer_name',
  'is_active',
  'created',
];

interface CustomerMappingsListProps {
  settings?: { uuid: string } | null;
}

export const CustomerMappingsList: FunctionComponent<
  CustomerMappingsListProps
> = ({ settings }) => {
  const formFilter = useSelector(filtersSelector);

  const filter = useMemo(
    () => ({
      ...formFilter,
      ...(settings?.uuid ? { settings_uuid: settings.uuid } : {}),
    }),
    [formFilter, settings?.uuid],
  );

  const tableProps = useTable({
    table: 'ArrowCustomerMappings',
    fetchData: createFetcher(adminArrowCustomerMappingsList),
    filter,
    queryField: 'arrow_company_name',
    mandatoryFields,
  });

  const expandableRow = useCallback(
    ({ row }: { row: ArrowCustomerMapping }) => (
      <CustomerMappingExpandableRow row={row} />
    ),
    [],
  );

  return (
    <Table<ArrowCustomerMapping>
      {...tableProps}
      expandableRow={expandableRow}
      columns={[
        {
          title: translate('Arrow Customer'),
          render: ({ row }) => (
            <div>
              <span className="text-dark fw-bold">
                {row.arrow_company_name}
              </span>
              <br />
              <code className="text-muted small">{row.arrow_reference}</code>
            </div>
          ),
        },
        {
          title: translate('Waldur Organization'),
          render: ({ row }) => (
            <span className="text-dark">{row.waldur_customer_name}</span>
          ),
          filter: 'organization',
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <Badge variant={row.is_active ? 'success' : 'default'} pill outline>
              {row.is_active ? translate('Active') : translate('Inactive')}
            </Badge>
          ),
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
        },
      ]}
      title={translate('Customer mappings')}
      verboseName={translate('customer mappings')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery
      filters={<CustomerMappingsFilter />}
      rowActions={({ row }) => (
        <CustomerMappingActions row={row} refetch={tableProps.fetch} />
      )}
      tableActions={<CustomerMappingCreateButton refetch={tableProps.fetch} />}
      enableMultiSelect
      multiSelectActions={CustomerMappingsBulkDeleteAction}
    />
  );
};
