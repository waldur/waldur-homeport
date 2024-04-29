import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/utils';
import { KeysListExpandableRow } from '@waldur/user/keys/KeysListExpandableRow';
import { KeysListTablePlaceholder } from '@waldur/user/keys/KeysListTablePlaceholder';
import { getUser, getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType, UserDetails } from '@waldur/workspace/types';

import { KeyCreateButton } from './KeyCreateButton';
import { KeyRemoveButton } from './KeyRemoveButton';

interface OwnProps {
  user?: UserDetails;
}

export const KeysList: FunctionComponent<OwnProps> = (props) => {
  const workspace = useSelector(getWorkspace);
  const currentUser = useSelector(getUser);
  const user = props.user || currentUser;
  const { params } = useCurrentStateAndParams();
  const isStaffOrSelf = currentUser.is_staff || params.uuid === user.uuid;
  const filter = useMemo(
    () => ({
      user_uuid: user?.uuid || params.uuid,
    }),
    [user, params],
  );
  const tableProps = useTable({
    table: 'keysList',
    fetchData: createFetcher('keys'),
    exportRow: (row) => [row.name, row.fingerprint],
    exportAll: true,
    exportFields: ['Title', 'Fingerprint'],
    exportKeys: ['name', 'fingerprint'],
    queryField: 'name',
    filter,
  });
  const columns: Column[] = [
    {
      title: translate('Title'),
      render: ({ row }) => row.name,
    },
    {
      title: translate('Fingerprint'),
      render: ({ row }) => (
        <>
          {row.fingerprint}
          <CopyToClipboardButton
            value={row.fingerprint}
            className="ms-1 text-hover-primary cursor-pointer d-inline-block"
          />
        </>
      ),
    },
    {
      title: translate('Type'),
      render: ({ row }) => row.type,
    },
  ];
  if (workspace === WorkspaceType.USER) {
    columns.push({
      title: translate('Actions'),
      render: ({ row }) => isStaffOrSelf && <KeyRemoveButton uuid={row.uuid} />,
      className: 'text-center col-md-2',
    });
  }

  return (
    <Table
      {...tableProps}
      columns={columns}
      hasQuery={true}
      showPageSizeSelector={true}
      verboseName={translate('SSH keys')}
      actions={
        isStaffOrSelf && workspace === WorkspaceType.USER && <KeyCreateButton />
      }
      placeholderComponent={<KeysListTablePlaceholder />}
      enableExport={true}
      expandableRow={KeysListExpandableRow}
    />
  );
};
