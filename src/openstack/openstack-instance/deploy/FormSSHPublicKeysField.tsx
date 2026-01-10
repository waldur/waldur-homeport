import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { keysList, KeysListData } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { ActionButton } from '@waldur/table/ActionButton';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableProps } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { keyCreateDialog } from '@waldur/user/keys/actions';
import { keysListTable } from '@waldur/user/keys/constants';
import { getUser } from '@waldur/workspace/selectors';

const filtersSelector = createSelector(getUser, (user) => {
  const result: KeysListData['query'] = {};
  if (user) {
    result.user_uuid = user.uuid;
  }
  return result;
});

interface OwnProps extends Pick<FormStepProps, 'change'>, Partial<TableProps> {}

export const FormSSHPublicKeysField = ({ change, ...props }: OwnProps) => {
  const filter = useSelector(filtersSelector);
  const tableProps = useTable({
    table: keysListTable,
    fetchData: createFetcher(keysList),
    onFetch: (rows, totalCount, firstFetch) => {
      if (firstFetch && totalCount === 1 && rows.length === 1) {
        change('attributes.ssh_public_key', rows[0]);
      }
    },
    filter,
  });

  const dispatch = useDispatch();
  const openFormDialog = useCallback(() => dispatch(keyCreateDialog()), []);

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
