import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { titleCase } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { formatEventTitle } from '@waldur/user/hooks/utils';

import {
  ADMIN_HOOKS_LIST_FILTER_FORM_ID,
  ADMIN_HOOK_LIST_ID,
} from './constants';
import { HooksListFilter } from './HooksListFilter';
import { HooksRowActions } from './HooksRowActions';

const StateField = ({ row }) => {
  const cls = row.is_active ? 'bg-success' : 'bg-danger';
  const title = row.is_active ? translate('Enabled') : translate('Disabled');
  return (
    <span
      className={`status-circle d-inline-block rounded w-10px h-10px ${cls}`}
      title={title}
      role="button"
    />
  );
};

const mapStateToFilter = createSelector(
  getFormValues(ADMIN_HOOKS_LIST_FILTER_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.state) {
      result.is_active = filters.state.value;
    }
    return result;
  },
);

const getDestinationField = (row) => row.destination_url || row.email || 'N/A';
const getEventsField = (row) =>
  row.event_groups.map(formatEventTitle).join(', ');

export const HooksList: FunctionComponent = () => {
  const filter = useSelector(mapStateToFilter);
  const tableProps = useTable({
    table: ADMIN_HOOK_LIST_ID,
    fetchData: createFetcher('hooks'),
    queryField: 'query',
    filter,
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('State'),
          className: 'text-center all',
          render: StateField,
          filter: 'state',
          export: (row) =>
            row.is_active ? translate('Enabled') : translate('Disabled'),
          exportKeys: ['is_active'],
        },
        {
          title: translate('Method'),
          render: ({ row }) => titleCase(row.hook_type),
          export: (row) => titleCase(row.hook_type),
          exportKeys: ['hook_type'],
        },
        {
          title: translate('Person'),
          render: ({ row }) => <>{row.author_fullname}</>,
          export: 'author_fullname',
        },
        {
          title: translate('Email'),
          render: ({ row }) => <>{row.author_email}</>,
          export: 'author_email',
        },
        {
          title: translate('Destination'),
          render: ({ row }) => getDestinationField(row),
          export: (row) => getDestinationField(row),
          exportKeys: ['destination_url', 'email'],
        },
        {
          title: translate('Events'),
          render: ({ row }) => getEventsField(row),
          export: (row) => getEventsField(row),
          exportKeys: ['event_groups'],
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
          export: (row) => formatDateTime(row.created),
          exportKeys: ['created'],
        },
      ]}
      showPageSizeSelector={true}
      verboseName={translate('Notifications')}
      rowActions={({ row }) => (
        <HooksRowActions row={row} refetch={tableProps.fetch} />
      )}
      enableExport={true}
      hasQuery={true}
      filters={<HooksListFilter />}
    />
  );
};
