import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { $state } from '@waldur/core/services';
import { Table, createFetcher, connectTable } from '@waldur/table-react';
import { KeysListTablePlaceholder } from '@waldur/user/keys/KeysListTablePlaceholder';
import { getUser } from '@waldur/workspace/selectors';

import { KeyCreateButton } from './KeyCreateButton';
import { KeyRemoveButton } from './KeyRemoveButton';
import { isStaffOrSelfSelectorCreator } from './selectors';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Title'),
          render: ({ row }) => row.name,
        },
        {
          title: translate('Fingerprint'),
          render: ({ row }) => row.fingerprint,
        },
        {
          title: translate('Actions'),
          render: ({ row }) =>
            props.isStaffOrSelf && <KeyRemoveButton uuid={row.uuid} />,
          className: 'text-center col-md-2',
        },
      ]}
      hasQuery={true}
      showPageSizeSelector={true}
      verboseName={translate('SSH keys')}
      actions={props.isStaffOrSelf && <KeyCreateButton />}
      placeholderComponent={<KeysListTablePlaceholder />}
      enableExport={true}
    />
  );
};

const TableOptions = {
  table: 'keysList',
  fetchData: createFetcher('keys'),
  mapPropsToFilter: props => ({
    user_uuid: $state.params.uuid || props.user.uuid,
  }),
  exportRow: row => [row.name, row.fingerprint],
  exportAll: true,
  exportFields: ['Title', 'Fingerprint'],
  queryField: 'name',
};

const mapStateToProps = state => ({
  user: getUser(state),
  isStaffOrSelf: isStaffOrSelfSelectorCreator($state.params)(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const KeysList = enhance(TableComponent);
