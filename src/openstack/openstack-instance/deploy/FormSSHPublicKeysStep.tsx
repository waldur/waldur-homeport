import { useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { keyCreateDialog } from '@waldur/user/keys/actions';
import { keysListTable } from '@waldur/user/keys/constants';
import { getUser } from '@waldur/workspace/selectors';

const filtersSelector = createSelector(getUser, (user) => {
  const result: Record<string, any> = {};
  if (user) {
    result.user_uuid = user.uuid;
  }
  return result;
});

export const FormSSHPublicKeysStep = (props: FormStepProps) => {
  const filter = useSelector(filtersSelector);
  const tableProps = useTable({
    table: keysListTable,
    fetchData: createFetcher('keys'),
    onFetch: (rows, totalCount, firstFetch) => {
      if (firstFetch && totalCount === 1 && rows.length === 1) {
        props.change('attributes.ssh_public_key', rows[0]);
      }
    },
    filter,
  });

  const dispatch = useDispatch();
  const openFormDialog = useCallback(() => dispatch(keyCreateDialog()), []);

  return (
    <VStepperFormStepCard
      title={translate('SSH public keys')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
      actions={
        <div className="d-flex justify-content-end flex-grow-1">
          <Button
            variant="light"
            className="text-nowrap"
            size="sm"
            onClick={openFormDialog}
          >
            <i className="fa fa-plus" />
            {translate('New public key')}
          </Button>
        </div>
      }
    >
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
        verboseName={translate('SSH keys')}
        hasActionBar={false}
        hoverable
        fieldType="radio"
        fieldName="attributes.ssh_public_key"
      />
    </VStepperFormStepCard>
  );
};
