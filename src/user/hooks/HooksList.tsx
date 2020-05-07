import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { titleCase } from '@waldur/core/utils';
import { Table, createFetcher, connectTable } from '@waldur/table-react';
import { HookListTablePlaceholder } from '@waldur/user/hooks/HookListTablePlaceholder';
import { getUser } from '@waldur/workspace/selectors';

import { HOOK_LIST_ID } from './constants';
import { HookCreateButton } from './HookCreateButton';
import { HookRemoveButton } from './HookRemoveButton';
import { HookUpdateButton } from './HookUpdateButton';
import { formatEventTitle } from './utils';

const StateField = ({ row }) => {
  const cls = (row.is_active && 'online') || '';
  const title = (row.is_active && 'Enabled') || 'Disabled';
  return <a className={`status-circle ${cls}`} title={title} />;
};

const getDestinationField = row => row.destination_url || row.email || 'N/A';
const getEventsField = row => row.event_groups.map(formatEventTitle).join(', ');

const TableComponent = props => {
  const { translate } = props;
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
        {
          title: translate('Actions'),
          render: ({ row }) => (
            <>
              <HookUpdateButton row={row} />
              <HookRemoveButton uuid={row.uuid} url={row.url} />
            </>
          ),
          className: 'text-center col-md-2',
        },
      ]}
      showPageSizeSelector={true}
      verboseName={translate('Notifications')}
      actions={<HookCreateButton />}
      placeholderComponent={<HookListTablePlaceholder />}
      enableExport={true}
    />
  );
};

const TableOptions = {
  table: HOOK_LIST_ID,
  fetchData: createFetcher('hooks'),
  mapPropsToFilter: props => ({ author_uuid: props.user.uuid }),
  exportRow: row => [
    titleCase(row.hook_type),
    getDestinationField(row),
    getEventsField(row),
  ],
  exportAll: true,
  exportFields: ['Method', 'Destination', 'Events'],
};

const mapStateToProps = state => ({
  user: getUser(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const HooksList = enhance(TableComponent);
