import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { titleCase } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { HookListTablePlaceholder } from '@waldur/user/hooks/HookListTablePlaceholder';
import { formatEventTitle } from '@waldur/user/hooks/utils';

import { ADMIN_HOOK_LIST_ID } from './constants';
import { HookRemoveButton } from './HookRemoveButton';
import { HookUpdateButton } from './HookUpdateButton';

import '@waldur/user/hooks/HookList.scss';

const StateField = ({ row }) => {
  const cls = row.is_active ? 'bg-success' : 'bg-danger';
  const title = row.is_active ? translate('Enabled') : translate('Disabled');
  return (
    <a
      className={`status-circle d-inline-block rounded square ${cls}`}
      title={title}
    />
  );
};

const getDestinationField = (row) => row.destination_url || row.email || 'N/A';
const getEventsField = (row) =>
  row.event_groups.map(formatEventTitle).join(', ');

export const HooksList: FunctionComponent<any> = () => {
  const tableProps = useTable({
    table: ADMIN_HOOK_LIST_ID,
    fetchData: createFetcher('hooks'),
    queryField: 'query',
    exportRow: (row) => [
      titleCase(row.hook_type),
      getDestinationField(row),
      getEventsField(row),
    ],
    exportAll: true,
    exportFields: ['Method', 'Destination', 'Events'],
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('State'),
          className: 'text-center all',
          render: StateField,
        },
        {
          title: translate('Method'),
          render: ({ row }) => titleCase(row.hook_type),
        },
        {
          title: translate('Person'),
          render: ({ row }) => <>{row.author_fullname}</>,
        },
        {
          title: translate('Email'),
          render: ({ row }) => <>{row.author_email}</>,
        },
        {
          title: translate('Destination'),
          render: ({ row }) => getDestinationField(row),
        },
        {
          title: translate('Events'),
          render: ({ row }) => getEventsField(row),
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
      ]}
      showPageSizeSelector={true}
      verboseName={translate('Notifications')}
      placeholderComponent={<HookListTablePlaceholder />}
      hoverableRow={({ row }) => (
        <div className="list_active_button_container">
          <HookUpdateButton row={row} />
          <HookRemoveButton uuid={row.uuid} url={row.url} />
        </div>
      )}
      enableExport={true}
      fullWidth
    />
  );
};
