import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { titleCase } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, createFetcher, connectTable } from '@waldur/table';
import { HookListTablePlaceholder } from '@waldur/user/hooks/HookListTablePlaceholder';
import { getUser } from '@waldur/workspace/selectors';

import { HOOK_LIST_ID } from './constants';
import { HookCreateButton } from './HookCreateButton';
import './HookList.scss';
import { HookRemoveButton } from './HookRemoveButton';
import { HookUpdateButton } from './HookUpdateButton';
import { formatEventTitle } from './utils';

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

const TableComponent: FunctionComponent<any> = (props) => {
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
            <div className="list_active_button_container">
              <HookUpdateButton row={row} />
              <HookRemoveButton uuid={row.uuid} url={row.url} />
            </div>
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
  mapPropsToFilter: (props) => ({ author_uuid: props.user.uuid }),
  exportRow: (row) => [
    titleCase(row.hook_type),
    getDestinationField(row),
    getEventsField(row),
  ],
  exportAll: true,
  exportFields: ['Method', 'Destination', 'Events'],
};

const mapStateToProps = (state: RootState) => ({
  user: getUser(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const HooksList = enhance(TableComponent);
