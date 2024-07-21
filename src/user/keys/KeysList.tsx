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
    exportRow: (row) => [
      row.name,
      row.public_key,
      row.type,
      row.fingerprint_md5,
      row.fingerprint_sha256,
      row.fingerprint_sha512,
    ],
    exportAll: true,
    exportFields: [
      'Title',
      'Public key',
      'Type',
      'Fingerprint (MD5)',
      'Fingerprint (SHA256)',
      'Fingerprint (SHA512)',
    ],
    exportKeys: [
      'name',
      'public_key',
      'type',
      'fingerprint_md5',
      'fingerprint_sha256',
      'fingerprint_sha512',
    ],
    queryField: 'name',
    filter,
  });
  const columns: Column[] = [
    {
      title: translate('Title'),
      render: ({ row }) => row.name,
    },
    {
      title: translate('Type'),
      render: ({ row }) => row.type,
    },
    {
      title: translate('Fingerprint (SHA256)'),
      render: ({ row }) => (
        <CopyToClipboardContainer value={row.fingerprint_sha256} />
      ),
    },
    {
      title: translate('Fingerprint (SHA512)'),
      render: ({ row }) => (
        <CopyToClipboardContainer value={row.fingerprint_sha512} />
      ),
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
      enableExport={true}
      expandableRow={KeysListExpandableRow}
      hasActionBar={hasActionBar}
    />
  );
};
