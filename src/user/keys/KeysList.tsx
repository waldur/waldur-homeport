import { FunctionComponent, useMemo } from 'react';
import { keysList, SshKey } from 'waldur-js-client';

import { CopyToClipboardContainer } from '@/core/CopyToClipboardContainer';
import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { KeysListExpandableRow } from '@/user/keys/KeysListExpandableRow';
import { useUser } from '@/workspace/hooks';

import { KeyCreateButton } from './KeyCreateButton';
import { KeyRemoveButton } from './KeyRemoveButton';
import { KeyVersionHistoryAction } from './KeyVersionHistoryAction';

const KeysListRowActions = ({ row, fetch }) => {
  const user = useUser();
  const showVersionHistory = user?.is_staff || user?.is_support;
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        KeyRemoveButton,
        showVersionHistory && KeyVersionHistoryAction,
      ].filter(Boolean)}
    />
  );
};

export const KeysList: FunctionComponent<{ user; hasActionBar? }> = ({
  user,
  hasActionBar = true,
}) => {
  const currentUser = useUser();
  const isSelf = user.uuid === currentUser.uuid;
  const filter = useMemo(
    () => ({
      user_uuid: user.uuid,
    }),
    [user],
  );
  const props = useTable({
    table: 'keysList',
    fetchData: createFetcher(keysList),
    queryField: 'name',
    filter,
  });
  const columns: Column<SshKey>[] = [
    {
      title: translate('Title'),
      render: ({ row }) => row.name,
      export: 'name',
      copyField: (row) => row.name,
    },
    {
      visible: false,
      title: translate('Public key'),
      render: null,
      export: 'public_key',
      copyField: (row) => row.public_key,
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

  return (
    <Table
      {...props}
      columns={columns}
      hasQuery={true}
      showPageSizeSelector={true}
      verboseName={translate('SSH keys')}
      tableActions={isSelf && <KeyCreateButton />}
      rowActions={isSelf && KeysListRowActions}
      enableExport={true}
      expandableRow={KeysListExpandableRow}
      hasActionBar={hasActionBar}
    />
  );
};
