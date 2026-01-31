import { FunctionComponent, useMemo } from 'react';
import {
  adminArrowVendorOfferingMappingsList,
  ArrowVendorOfferingMapping,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { VendorOfferingMappingActions } from './VendorOfferingMappingActions';
import { VendorOfferingMappingCreateButton } from './VendorOfferingMappingCreateButton';

const mandatoryFields: Array<keyof ArrowVendorOfferingMapping> = [
  'uuid',
  'arrow_vendor_name',
  'offering_name',
  'offering_type',
  'is_active',
  'created',
];

interface VendorOfferingMappingsListProps {
  settings?: { uuid: string } | null;
}

export const VendorOfferingMappingsList: FunctionComponent<
  VendorOfferingMappingsListProps
> = ({ settings }) => {
  const filter = useMemo(
    () => ({
      ...(settings?.uuid ? { settings_uuid: settings.uuid } : {}),
    }),
    [settings?.uuid],
  );

  const tableProps = useTable({
    table: 'ArrowVendorOfferingMappings',
    fetchData: createFetcher(adminArrowVendorOfferingMappingsList),
    filter,
    queryField: 'arrow_vendor_name',
    mandatoryFields,
  });

  return (
    <Table<ArrowVendorOfferingMapping>
      {...tableProps}
      columns={[
        {
          title: translate('Arrow Vendor'),
          render: ({ row }) => (
            <span className="fw-bold text-dark">{row.arrow_vendor_name}</span>
          ),
        },
        {
          title: translate('Waldur Offering'),
          render: ({ row }) => (
            <div>
              <span className="text-dark">
                {row.offering_name || DASH_ESCAPE_CODE}
              </span>
              {row.offering_type && (
                <>
                  <br />
                  <code className="text-muted small">{row.offering_type}</code>
                </>
              )}
            </div>
          ),
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
      title={translate('Vendor offering mappings')}
      verboseName={translate('vendor offering mappings')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery
      rowActions={({ row }) => (
        <VendorOfferingMappingActions row={row} refetch={tableProps.fetch} />
      )}
      tableActions={
        <VendorOfferingMappingCreateButton
          settings={settings}
          refetch={tableProps.fetch}
        />
      }
    />
  );
};
