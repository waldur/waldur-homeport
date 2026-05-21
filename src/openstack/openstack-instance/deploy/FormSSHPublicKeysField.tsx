import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useForm } from 'react-final-form';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { keysList, KeysListData } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableProps } from '@/table/types';
import { useTable } from '@/table/useTable';
import { keysListTable } from '@/user/keys/constants';
import { getUser } from '@/workspace/selectors';

const KeyCreateDialog = lazyComponent(() =>
  import('@/user/keys/KeyCreateDialog').then((module) => ({
    default: module.KeyCreateDialog,
  })),
);

const filtersSelector = createSelector(getUser, (user) => {
  const result: KeysListData['query'] = {};
  if (user) {
    result.user_uuid = user.uuid;
  }
  return result;
});

export const FormSSHPublicKeysField = (props: Partial<TableProps>) => {
  const form = useForm();
  const filter = useSelector(filtersSelector);
  const tableProps = useTable({
    table: keysListTable,
    fetchData: createFetcher(keysList),
    onFetch: (rows, totalCount, firstFetch) => {
      if (firstFetch && totalCount === 1 && rows.length === 1) {
        form.change('attributes.ssh_public_key', rows[0]);
      }
    },
    filter,
  });

  const { openDialog } = useModal();
  const openFormDialog = useCallback(
    () => openDialog(KeyCreateDialog, { size: 'lg' }),
    [openDialog],
  );

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Key name'),
          render: ({ row }) => row.name,
          orderField: 'name',
        },
        {
          title: translate('Type'),
          render: ({ row }) => row.type,
        },
        {
          title: translate('Fingerprint (MD5)'),
          render: ({ row }) => row.fingerprint_md5,
        },
      ]}
      title={translate('SSH public keys')}
      verboseName={translate('SSH keys')}
      tableActions={
        <ActionButton
          action={openFormDialog}
          title={translate('Create new')}
          iconNode={<PlusCircleIcon weight="bold" />}
          className="text-nowrap"
        />
      }
      hoverable
      fieldType="radio"
      fieldName="attributes.ssh_public_key"
      {...props}
    />
  );
};
