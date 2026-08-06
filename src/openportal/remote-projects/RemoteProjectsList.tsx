import { useMemo } from 'react';
import { openportalRemoteProjectsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import {
  OpenportalRemoteProjectsFilter,
  selectOpenportalRemoteProjectsFilter,
  OpenportalRemoteProjectsFilterFormId,
} from '@/table/generated/OpenportalRemoteProjectsFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { RemoteProjectActions } from './RemoteProjectActions';
import { RemoteProjectStateField } from './RemoteProjectStateField';

export const RemoteProjectsList = () => {
  useTitle(translate('Remote Projects'), '', 'browser');

  const customer = useCustomer();
  const user = useUser();
  const canEdit = checkIsOwnerOrStaff(customer, user) || user?.is_support;

  const values = useFilterValues('RemoteProjectsList');

  const filter = useMemo(() => {
    const selected = selectOpenportalRemoteProjectsFilter(values);
    return { ...selected, customer_uuid: customer?.uuid };
  }, [values, customer?.uuid]);

  const tableProps = useTable({
    table: 'RemoteProjectsList',
    syncFiltersToURL: true,
    fetchData: createFetcher(openportalRemoteProjectsList),
    queryField: 'query',
    filter,
  });

  const columns: Array<Column> = [
    {
      title: translate('Project'),
      orderField: 'current_project_name',
      render: ({ row }) => (
        <Link
          state="organization-remote-project-detail"
          params={{ remoteProjectUuid: row.uuid }}
        >
          {row.current_project_name || DASH_ESCAPE_CODE}
        </Link>
      ),
      keys: ['current_project_name'],
      id: 'project',
    },
    {
      title: translate('Destination'),
      orderField: 'destination',
      render: ({ row }) => renderFieldOrDash(row.destination),
      keys: ['destination'],
      id: 'destination',
    },
    {
      title: translate('Identifier'),
      orderField: 'identifier',
      render: ({ row }) => renderFieldOrDash(row.identifier),
      keys: ['identifier'],
      optional: true,
      id: 'identifier',
    },
    {
      title: translate('State'),
      orderField: 'state',
      render: ({ row }) =>
        row.error_message ? (
          <Tip
            id={`remote-project-state-${row.uuid}`}
            label={row.error_message}
          >
            <RemoteProjectStateField project={row} />
          </Tip>
        ) : (
          <RemoteProjectStateField project={row} />
        ),
      keys: ['state', 'error_message'],
      id: 'state',
    },
    {
      title: translate('Notes'),
      render: ({ row }) => (row.notes ?? []).length,
      keys: ['notes'],
      optional: true,
      id: 'notes',
    },
    {
      title: translate('Current allocation'),
      render: ({ row }) => renderFieldOrDash(row.current_allocation),
      keys: ['current_allocation'],
      id: 'current_allocation',
    },
    {
      title: translate('Pending allocation'),
      render: ({ row }) => renderFieldOrDash(row.pending_allocation),
      keys: ['pending_allocation'],
      optional: true,
      id: 'pending_allocation',
    },
    {
      title: translate('Last contact'),
      orderField: 'last_contact_time',
      render: ({ row }) =>
        row.last_contact_time ? (
          <>{formatDateTime(row.last_contact_time)}</>
        ) : (
          DASH_ESCAPE_CODE
        ),
      keys: ['last_contact_time'],
      optional: true,
      id: 'last_contact',
    },
    {
      title: translate('Created'),
      orderField: 'created',
      render: ({ row }) => (
        <>{row.created ? formatDateTime(row.created) : DASH_ESCAPE_CODE}</>
      ),
      keys: ['created'],
      optional: true,
      id: 'created',
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('Remote Projects')}
      title={translate('Remote Projects')}
      showPageSizeSelector={true}
      standalone
      hasQuery
      hasOptionalColumns
      tableActions={
        <Link
          state="organization-remote-projects-audit"
          buttonVariant="outline-primary"
        >
          {translate('Audit Log')}
        </Link>
      }
      rowActions={
        canEdit
          ? ({ row }) => (
              <RemoteProjectActions row={row} refetch={tableProps.fetch} />
            )
          : undefined
      }
      filters={<OpenportalRemoteProjectsFilter />}
      formId={OpenportalRemoteProjectsFilterFormId}
    />
  );
};
