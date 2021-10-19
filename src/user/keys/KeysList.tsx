import { FunctionComponent } from 'react';
import { connect, useSelector } from 'react-redux';
import { compose } from 'redux';

import { useTitle } from '@waldur/navigation/title';
import { router } from '@waldur/router';
import { RootState } from '@waldur/store/reducers';
import { Table, createFetcher, connectTable } from '@waldur/table';
import { Column } from '@waldur/table/types';
import { KeysListExpandableRow } from '@waldur/user/keys/KeysListExpandableRow';
import { KeysListTablePlaceholder } from '@waldur/user/keys/KeysListTablePlaceholder';
import { getUser, getWorkspace } from '@waldur/workspace/selectors';
import { SUPPORT_WORKSPACE, UserDetails } from '@waldur/workspace/types';

import { KeyCreateButton } from './KeyCreateButton';
import { KeyRemoveButton } from './KeyRemoveButton';
import { isStaffOrSelfSelectorCreator } from './selectors';

interface OwnProps {
  user: UserDetails;
}

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  useTitle(translate('SSH keys'));

  const workspace = useSelector(getWorkspace);
  const columns: Column[] = [
    {
      title: translate('Title'),
      render: ({ row }) => row.name,
    },
    {
      title: translate('Fingerprint'),
      render: ({ row }) => row.fingerprint,
    },
    {
      title: translate('Type'),
      render: ({ row }) => row.type,
    },
  ];
  if (workspace !== SUPPORT_WORKSPACE) {
    columns.push({
      title: translate('Actions'),
      render: ({ row }) =>
        props.isStaffOrSelf && <KeyRemoveButton uuid={row.uuid} />,
      className: 'text-center col-md-2',
    });
  }

  return (
    <Table
      {...props}
      columns={columns}
      hasQuery={true}
      showPageSizeSelector={true}
      verboseName={translate('SSH keys')}
      actions={props.isStaffOrSelf && <KeyCreateButton />}
      placeholderComponent={<KeysListTablePlaceholder />}
      enableExport={true}
      expandableRow={KeysListExpandableRow}
    />
  );
};

const TableOptions = {
  table: 'keysList',
  fetchData: createFetcher('keys'),
  mapPropsToFilter: (props) => ({
    user_uuid: router.globals.params.uuid || props.user?.uuid,
  }),
  exportRow: (row) => [row.name, row.fingerprint],
  exportAll: true,
  exportFields: ['Title', 'Fingerprint'],
  queryField: 'name',
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  user: ownProps.user || getUser(state),
  isStaffOrSelf: isStaffOrSelfSelectorCreator(router.globals.params)(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const KeysList = enhance(TableComponent);
