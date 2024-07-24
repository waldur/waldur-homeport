import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/utils';
import { KeysListExpandableRow } from '@waldur/user/keys/KeysListExpandableRow';
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
    queryField: 'name',
    filter,
  });
  const columns: Column[] = [
    {
      title: translate('Title'),
      render: ({ row }) => row.name,
      export: 'name',
    },
    {
      visible: false,
      title: translate('Public key'),
      render: null,
      export: 'public_key',
    },
    {
      title: translate('Type'),
      render: ({ row }) => row.type,
      export: 'type',
    },
    {
      visible: false,
      title: translate('Fingerprint (MD5)'),
      render: null,
      export: 'fingerprint_md5',
    },
    {
      title: translate('Fingerprint (SHA256)'),
      render: ({ row }) => (
        <CopyToClipboardContainer value={row.fingerprint_sha256} />
      ),
      export: 'fingerprint_sha256',
    },
    {
      visible: false,
      title: translate('Fingerprint (SHA512)'),
      render: null,
      export: 'fingerprint_sha512',
    },
  ];

  if (isStaffOrSelf) {
    columns.push({
      title: translate('Actions'),
      render: ({ row }) => (
        <KeyRemoveButton uuid={row.uuid} refetch={props.fetch} />
      ),
      className: 'text-center col-md-2',
      export: false,
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
      enableExport={true}
      expandableRow={KeysListExpandableRow}
      hasActionBar={hasActionBar}
    />
  );
};
