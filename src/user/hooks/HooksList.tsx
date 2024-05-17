import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { titleCase } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { HookListTablePlaceholder } from '@waldur/user/hooks/HookListTablePlaceholder';
import { getUser } from '@waldur/workspace/selectors';

import { HOOK_LIST_ID } from './constants';
import { HookCreateButton } from './HookCreateButton';
import { HookRemoveButton } from './HookRemoveButton';
import { HookUpdateButton } from './HookUpdateButton';
import { formatEventTitle } from './utils';
import './HookList.scss';

const StateField = ({ row }) => {
  const cls = row.is_active ? 'bg-success' : 'bg-danger';
  const title = row.is_active ? translate('Enabled') : translate('Disabled');
  return (
    <span
      className={`status-circle d-inline-block rounded square ${cls}`}
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
    exportRow: (row) => [
      titleCase(row.hook_type),
      getDestinationField(row),
      getEventsField(row),
    ],
    exportAll: true,
    exportFields: ['Method', 'Destination', 'Events'],
    exportKeys: ['hook_type', 'destination_url', 'email', 'event_groups'],
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('State'),
          className: 'text-center all',
          render: StateField,
        },
        {
          title: translate('Method'),
          className: 'min-tablet-l',
          render: ({ row }) => titleCase(row.hook_type),
        },
        {
          title: translate('Destination'),
          className: 'min-tablet-l',
          render: ({ row }) => getDestinationField(row),
        },
        {
          title: translate('Events'),
          className: 'min-tablet-l',
          render: ({ row }) => getEventsField(row),
        },
      ]}
      showPageSizeSelector={true}
      verboseName={translate('Notifications')}
      actions={<HookCreateButton />}
      placeholderComponent={<HookListTablePlaceholder />}
      hoverableRow={({ row }) => (
        <div className="list_active_button_container">
          <HookUpdateButton row={row} />
          <HookRemoveButton url={row.url} refetch={props.fetch} />
        </div>
      )}
      enableExport={true}
    />
  );
};
