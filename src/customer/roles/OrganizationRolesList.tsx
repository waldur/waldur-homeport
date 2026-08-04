import {
  CopyIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import {
  RoleDetails,
  customerRoleConcealmentsCreate,
  customerRoleConcealmentsDestroy,
  customerRoleConcealmentsList,
  rolesDestroy,
  rolesList,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { Badge } from '@/core/Badge';
import { lazyComponent } from '@/core/lazyComponent';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ROLE_TYPES } from '@/permissions/constants';
import { formatRoleType } from '@/permissions/utils';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionButton } from '@/table/ActionButton';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import {
  RolesFilter,
  RolesFilterFormId,
  selectRolesFilter,
} from '@/table/generated/RolesFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import { RoleUsersExpandableRow } from './RoleUsersExpandableRow';

const CloneRoleDialog = lazyComponent(() =>
  import('./CloneRoleDialog').then((module) => ({
    default: module.CloneRoleDialog,
  })),
);

const EditRolePermissionsDialog = lazyComponent(() =>
  import('./EditRolePermissionsDialog').then((module) => ({
    default: module.EditRolePermissionsDialog,
  })),
);

const EditRolePermissionsAction: FC<{
  row: RoleDetails;
  refetch: () => void;
}> = ({ row, refetch }) => {
  const { openDialog } = useModal();
  const open = useCallback(
    () => openDialog(EditRolePermissionsDialog, { resolve: { row, refetch } }),
    [openDialog, row, refetch],
  );
  return (
    <ActionItem
      title={translate('Edit permissions')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={open}
    />
  );
};

const CloneRoleButton: FC<{ customerUuid: string; refetch: () => void }> = ({
  customerUuid,
  refetch,
}) => {
  const { openDialog } = useModal();
  const open = useCallback(
    () => openDialog(CloneRoleDialog, { resolve: { customerUuid, refetch } }),
    [openDialog, customerUuid, refetch],
  );
  return (
    <ActionButton
      action={open}
      title={translate('Clone role')}
      variant="primary"
      iconNode={<CopyIcon weight="bold" />}
    />
  );
};

const ConcealRoleAction: FC<{
  row: RoleDetails;
  customerUuid: string;
  refetch: () => void;
}> = ({ row, customerUuid, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      customerRoleConcealmentsCreate({
        body: { role: row.uuid, customer: customerUuid },
      }),
    successMessage: translate('Role has been concealed for the organization.'),
    errorMessage: translate('Unable to conceal role.'),
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Conceal role {name}? It will no longer be grantable in this organization; existing assignments are kept.',
        { name: <strong>{row.description || row.name}</strong> },
        formatJsxTemplate,
      ),
    },
    refetch,
    // Refresh the scoped role lists used by the Add member / Invite pickers.
    invalidateQueries: [{ queryKey: ['available-roles-for-customer'] }],
  });
  return (
    <ActionItem
      action={mutate}
      disabled={isPending}
      title={translate('Conceal')}
      iconNode={<EyeSlashIcon weight="bold" />}
      className="text-danger"
    />
  );
};

const DeleteRoleAction: FC<{
  row: RoleDetails;
  refetch: () => void;
}> = ({ row, refetch }) => {
  const inUse = Boolean(row.users_count);
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => rolesDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Role has been deleted.'),
    errorMessage: translate('Unable to delete role.'),
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Delete the organization role {name}?',
        { name: <strong>{row.description || row.name}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
    refetch,
    invalidateQueries: [{ queryKey: ['available-roles-for-customer'] }],
  });
  return (
    <ActionItem
      action={mutate}
      disabled={isPending || inUse}
      tooltip={
        inUse
          ? translate('Role is assigned to users and cannot be deleted.')
          : undefined
      }
      title={translate('Delete')}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
    />
  );
};

const RevealRoleAction: FC<{
  concealmentUuid: string;
  refetch: () => void;
}> = ({ concealmentUuid, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      customerRoleConcealmentsDestroy({ path: { uuid: concealmentUuid } }),
    successMessage: translate('Role has been revealed for the organization.'),
    errorMessage: translate('Unable to reveal role.'),
    refetch,
    invalidateQueries: [{ queryKey: ['available-roles-for-customer'] }],
  });
  return (
    <ActionItem
      action={mutate}
      disabled={isPending}
      title={translate('Reveal')}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};

export const OrganizationRolesList: FC = () => {
  const customer = useCustomer();
  const customerUuid = customer?.uuid;
  const tableId = `org-roles-${customerUuid}`;

  // Only organization- and project-scoped roles are manageable here: they are
  // the only scopes that can be concealed or cloned into an organization. Roles
  // for other scopes (offering, service provider, call) would be view-only and
  // are handled in the global role administration instead, so they are excluded
  // to keep every row actionable. These bound the Scope filter options and the
  // default server-side query.
  const scopeOptions = useMemo(
    () =>
      ROLE_TYPES.filter(
        (option) => option.value === 'customer' || option.value === 'project',
      ),
    [],
  );
  const contentTypes = useMemo(
    () => scopeOptions.map((option) => option.value).join(','),
    [scopeOptions],
  );

  const filterValues = useFilterValues(tableId);
  const filter = useMemo(() => {
    const selected = selectRolesFilter(filterValues);
    return {
      available_for_customer: customerUuid,
      // A picked Scope narrows within the applicable set; otherwise all
      // applicable scopes are queried.
      content_type: contentTypes,
      ...selected,
    };
  }, [filterValues, customerUuid, contentTypes]);

  const tableProps = useTable({
    table: tableId,
    fetchData: createFetcher(rolesList),
    filter,
    queryField: 'query',
    syncFiltersToURL: true,
  });

  // Concealment records for this org: role uuid -> concealment uuid, used to
  // mark concealed rows and to reveal them.
  const concealmentsQuery = useQuery({
    queryKey: ['customer-role-concealments', customerUuid],
    queryFn: () =>
      getAllPages((page) =>
        customerRoleConcealmentsList({
          query: { scope_uuid: customerUuid, page },
        }),
      ),
    enabled: Boolean(customerUuid),
  });
  const concealedMap = useMemo(
    () => new Map((concealmentsQuery.data ?? []).map((c) => [c.role, c.uuid])),
    [concealmentsQuery.data],
  );

  const refetchAll = useCallback(() => {
    tableProps.fetch();
    concealmentsQuery.refetch();
  }, [tableProps, concealmentsQuery]);

  if (!customerUuid) {
    return null;
  }

  return (
    <Table<RoleDetails>
      {...tableProps}
      title={translate('Available roles')}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => renderFieldOrDash(row.description),
        },
        {
          // `name` is the technical code, not a label — see RolesList.
          title: translate('Code'),
          orderField: 'name',
          render: ({ row }) => (
            <span className="font-monospace">{row.name}</span>
          ),
          copyField: (row) => row.name,
        },
        {
          title: translate('Type'),
          render: ({ row }) => (
            <>
              {row.is_system_role ? (
                <Badge variant="secondary" pill outline>
                  {translate('System role')}
                </Badge>
              ) : (
                <Badge variant="success" pill outline>
                  {translate('Organization role')}
                </Badge>
              )}
              {concealedMap.has(row.uuid) && (
                <Badge variant="warning" pill outline className="ms-1">
                  {translate('Concealed')}
                </Badge>
              )}
            </>
          ),
        },
        {
          title: translate('Scope'),
          orderField: 'scope',
          render: ({ row }) => formatRoleType(row.content_type),
        },
        {
          title: translate('Origin'),
          orderField: 'origin',
          render: ({ row }) =>
            row.template_name
              ? translate('Cloned from {name}', { name: row.template_name })
              : translate('System'),
        },
      ]}
      verboseName={translate('roles')}
      expandableRow={({ row }) => (
        <RoleUsersExpandableRow row={row} customerUuid={customerUuid} />
      )}
      rowActions={({ row }) => {
        const concealmentUuid = concealedMap.get(row.uuid);
        // Only customer- and project-scoped roles can be concealed for an
        // organization (backend rule).
        const isConcealable =
          row.content_type === 'customer' || row.content_type === 'project';
        return (
          <ActionsDropdown row={row} refetch={refetchAll}>
            {concealmentUuid ? (
              <RevealRoleAction
                concealmentUuid={concealmentUuid}
                refetch={refetchAll}
              />
            ) : row.is_system_role ? (
              isConcealable ? (
                <ConcealRoleAction
                  row={row}
                  customerUuid={customerUuid}
                  refetch={refetchAll}
                />
              ) : null
            ) : (
              <>
                <EditRolePermissionsAction row={row} refetch={refetchAll} />
                <DeleteRoleAction row={row} refetch={refetchAll} />
              </>
            )}
          </ActionsDropdown>
        );
      }}
      filters={<RolesFilter scopeOptions={scopeOptions} />}
      formId={RolesFilterFormId}
      tableActions={
        <CloneRoleButton customerUuid={customerUuid} refetch={refetchAll} />
      }
    />
  );
};
