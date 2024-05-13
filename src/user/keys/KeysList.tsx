import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/utils';
import { KeysListExpandableRow } from '@waldur/user/keys/KeysListExpandableRow';
import { KeysListTablePlaceholder } from '@waldur/user/keys/KeysListTablePlaceholder';
import { getUser } from '@waldur/workspace/selectors';

import { KeyCreateButton } from './KeyCreateButton';
import { KeyRemoveButton } from './KeyRemoveButton';

export const KeysList: FunctionComponent<{ user; hasActionBar? }> = ({
  user,
  hasActionBar = true,
}) => {
  const currentUser = useSelector(getUser);
  const isStaffOrSelf = currentUser.is_staff || user.uuid === currentUser.uuid;
  const filter = useMemo(
    () => ({
      user_uuid: user.uuid,
    }),
    [user],
  );
  const props = useTable({
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

  if (isStaffOrSelf) {
    columns.push({
      title: translate('Actions'),
      render: ({ row }) => (
        <KeyRemoveButton uuid={row.uuid} refetch={props.fetch} />
      ),
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
      actions={isStaffOrSelf && <KeyCreateButton />}
      placeholderComponent={<KeysListTablePlaceholder />}
      enableExport={true}
      expandableRow={KeysListExpandableRow}
      hasActionBar={hasActionBar}
    />
  );
};
