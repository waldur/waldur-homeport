import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { titleCase } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getUser } from '@waldur/workspace/selectors';

import { HOOK_LIST_ID } from './constants';
import { HookCreateButton } from './HookCreateButton';
import { HookRemoveButton } from './HookRemoveButton';
import { HookUpdateButton } from './HookUpdateButton';
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

const getDestinationField = (row) => row.destination_url || row.email || 'N/A';
const getEventsField = (row) =>
  row.event_groups.map(formatEventTitle).join(', ');

const mapStateToProps = createSelector(getUser, (user) => ({
  author_uuid: user.uuid,
}));

export const HooksList: FunctionComponent = () => {
  const filter = useSelector(mapStateToProps);
  const props = useTable({
    table: HOOK_LIST_ID,
    fetchData: createFetcher('hooks'),
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('State'),
          className: 'text-center all',
          render: StateField,
          export: false,
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
      tableActions={<HookCreateButton />}
      rowActions={({ row }) => (
        <>
          <HookUpdateButton row={row} />
          <HookRemoveButton url={row.url} refetch={props.fetch} />
        </>
      )}
      enableExport={true}
    />
  );
};
