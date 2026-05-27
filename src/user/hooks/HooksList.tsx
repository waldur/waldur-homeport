import { FunctionComponent, useMemo } from 'react';
import { hooksList } from 'waldur-js-client';

import { HooksRowActions } from '@/administration/hooks/HooksRowActions';
import { titleCase } from '@/core/utils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { HOOK_LIST_ID } from './constants';
import { HookCreateButton } from './HookCreateButton';
import { formatEventTitle } from './utils';

const StateField = ({ row }) => {
  const cls = row.is_active ? 'bg-success' : 'bg-danger';
  const title = row.is_active ? translate('Enabled') : translate('Disabled');
  return (
    <span
      className={`status-circle d-inline-block rounded w-10px h-10px ${cls}`}
      title={title}
    />
  );
};

const getDestinationField = (row) =>
  renderFieldOrDash(row.destination_url || row.email);
const getEventsField = (row) =>
  row.event_groups.map(formatEventTitle).join(', ');

export const HooksList: FunctionComponent = () => {
  const user = useUser();
  const filter = useMemo(
    () => ({
      author_uuid: user?.uuid,
    }),
    [user],
  );
  const props = useTable({
    table: HOOK_LIST_ID,
    fetchData: createFetcher(hooksList),
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('State'),
          className: 'text-center',
          render: StateField,
          export: false,
          width: '4%',
        },
        {
          title: translate('Method'),
          className: 'min-tablet-l',
          render: ({ row }) => titleCase(row.hook_type),
          export: (row) => titleCase(row.hook_type),
          exportKeys: ['hook_type'],
        },
        {
          title: translate('Destination'),
          className: 'min-tablet-l',
          render: ({ row }) => getDestinationField(row),
          export: (row) => getDestinationField(row),
          exportKeys: ['destination_url', 'email'],
        },
        {
          title: translate('Events'),
          className: 'min-tablet-l',
          render: ({ row }) => getEventsField(row),
          export: (row) => getEventsField(row),
          exportKeys: ['event_groups'],
        },
      ]}
      showPageSizeSelector={true}
      verboseName={translate('Notifications')}
      tableActions={<HookCreateButton refetch={props.fetch} />}
      rowActions={({ row }) => (
        <HooksRowActions row={row} refetch={props.fetch} />
      )}
      enableExport={true}
    />
  );
};
