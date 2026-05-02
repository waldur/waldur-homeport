import { TrashIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  roleAvailabilitiesDestroy,
  roleAvailabilitiesList,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/hooks';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const DeleteAvailabilityAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();
  const handler = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Delete availability of role "{role}" for {scope_type} "{scope}"? Active user role grants tied to this availability will be revoked asynchronously.',
          {
            role: row.role_name,
            scope_type: row.scope_type,
            scope: row.scope_name || row.scope_uuid || '?',
          },
        ),
      );
    } catch {
      return;
    }
    try {
      await roleAvailabilitiesDestroy({ path: { uuid: row.uuid } });
      showSuccess(translate('Role availability has been removed.'));
      await refetch();
    } catch (error) {
      showErrorResponse(
        error,
        translate('Unable to delete role availability.'),
      );
    }
  }, [dispatch, row, refetch, showSuccess, showErrorResponse]);

  return (
    <ActionItem
      title={translate('Delete')}
      action={handler}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
    />
  );
};

export const RoleAvailabilitiesList = () => {
  const tableProps = useTable({
    table: 'RoleAvailabilitiesList',
    fetchData: createFetcher(roleAvailabilitiesList),
  });

  return (
    <Table
      {...tableProps}
      title={translate('Role availabilities')}
      verboseName={translate('role availabilities')}
      columns={[
        {
          title: translate('Role'),
          render: ({ row }) => row.role_name,
          copyField: (row) => row.role_name,
        },
        {
          title: translate('Role scope'),
          render: ({ row }) => renderFieldOrDash(row.role_content_type),
        },
        {
          title: translate('Bound to'),
          render: ({ row }) => (
            <>
              <span>{row.scope_name || row.scope_uuid}</span>
              <Badge variant="default" pill outline className="ms-2">
                {row.scope_type}
              </Badge>
            </>
          ),
        },
        {
          title: translate('Source'),
          render: ({ row }) =>
            row.is_profile_managed ? (
              <Badge variant="info" pill outline>
                {translate('Profile: {name}', { name: row.profile_name })}
              </Badge>
            ) : (
              <Badge variant="default" pill outline>
                {translate('Direct')}
              </Badge>
            ),
        },
      ]}
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <DeleteAvailabilityAction row={row} refetch={tableProps.fetch} />
        </ActionsDropdown>
      )}
      showPageSizeSelector={true}
    />
  );
};
