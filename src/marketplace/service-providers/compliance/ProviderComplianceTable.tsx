import { FC, useMemo } from 'react';
import {
  ServiceProvider,
  serviceProviderComplianceOverview,
  ServiceProviderComplianceOverview,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { AssignOfferingChecklistButton } from './AssignOfferingChecklistButton';
import { ComplianceExpandableRow } from './ComplianceExpandableRow';

interface ProviderComplianceTableProps {
  provider?: ServiceProvider;
}

export const ProviderComplianceTable: FC<ProviderComplianceTableProps> = (
  props,
) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const tableProps = useTable({
    table: 'ProviderComplianceTable',
    fetchData: createFetcher(serviceProviderComplianceOverview, {
      path: { service_provider_uuid: props.provider?.uuid },
    }),
    queryField: 'name',
  });

  const columns: Column<ServiceProviderComplianceOverview>[] = useMemo(
    () => [
      {
        title: translate('Compliance checklist'),
        render: ({ row }) => renderFieldOrDash(row.checklist_name),
      },
      {
        title: translate('Offerings'),
        render: () => '0', // FIX: use real data - not available on backend atm
      },
      {
        title: translate('Customer project roles'),
        render: ({ row }) => row.users_with_completions || '0', // FIX: Not sure if it's correct
      },
      {
        title: translate('State'),
        render: () => {
          // FIX: use real data - not available on backend atm
          const state = { color: 'success', label: 'Active' };
          return (
            <Badge variant={state.color} size="sm" pill outline>
              {state.label}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  return (
    <Table<ServiceProviderComplianceOverview>
      {...tableProps}
      columns={columns}
      showPageSizeSelector
      verboseName={translate('Compliance')}
      hasQuery
      tableActions={
        <AssignOfferingChecklistButton
          provider={props.provider}
          refetch={tableProps.fetch}
        />
      }
      expandableRow={
        showExperimentalUiComponents ? ComplianceExpandableRow : undefined
      }
    />
  );
};
