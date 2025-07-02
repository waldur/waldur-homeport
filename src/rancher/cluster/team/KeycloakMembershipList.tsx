import { CaretDownIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, memo, useMemo } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import {
  KeycloakUserGroupMembership,
  KeycloakUserGroupMembershipsListData,
  Resource,
} from 'waldur-js-client';

import Avatar from '@waldur/core/Avatar';
import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { AddResourceAccessButton } from './AddResourceAccessButton';
import { KeycloakMembershipBulkRemoveAction } from './KeycloakMembershipBulkRemoveAction';
import { KeycloakMembershipExpandableRow } from './KeycloakMembershipExpandableRow';
import { KeycloakMembershipRowActions } from './KeycloakMembershipRowActions';
import { getKeycloakMembershipRoleColor } from './utils';

const TableActions = ({
  refetch,
  resource,
}: {
  refetch(): void;
  resource: Resource;
}) => {
  return (
    <Dropdown placement="bottom-end">
      <Dropdown.Toggle variant="primary" className="no-arrow btn-icon-right">
        <span className="svg-icon svg-icon-2">
          <PlusCircleIcon weight="bold" />
        </span>
        {translate('Add')}
        <span className="svg-icon svg-icon-2 rotate-180">
          <CaretDownIcon weight="bold" />
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu flip>
        <AddResourceAccessButton refetch={refetch} resource={resource} />
      </Dropdown.Menu>
    </Dropdown>
  );
};

const BulkActions = ({ rows, refetch }) => (
  <DropdownButton variant="primary" title={translate('Actions')}>
    <KeycloakMembershipBulkRemoveAction rows={rows} refetch={refetch} />
  </DropdownButton>
);

const UserField = ({ row }) => (
  <div className="d-flex align-items-center gap-1">
    <Avatar name={row?.email} size={40} circle />
    <div>
      <span className="d-block">
        {renderFieldOrDash(
          [row.first_name, row.last_name].filter(Boolean).join(' '),
        )}
      </span>
      <span className="d-block">{row.username}</span>
    </div>
  </div>
);

const ExpandableRow = memo((row: any, resource: any) => (
  <KeycloakMembershipExpandableRow row={row} resource={resource} />
));

export const KeycloakMembershipList: FunctionComponent<
  TableWithPortal<{ resourceScope: Resource }>
> = ({ resourceScope, portal }) => {
  const filter = useMemo(
    () =>
      ({
        scope_uuid: resourceScope.resource_uuid,
        scope_type: 'cluster',
      }) satisfies KeycloakUserGroupMembershipsListData['query'],
    [resourceScope],
  );
  const props = useTable({
    table: 'rancher-keycloak-memberships',
    fetchData: createFetcher('keycloak-user-group-memberships'),
    filter,
    queryField: 'username',
  });

  return (
    <Table<KeycloakUserGroupMembership>
      {...props}
      columns={[
        {
          title: translate('User'),
          render: UserField,
          export: (row) =>
            `${row.first_name} ${row.last_name} (${row.username})`,
          orderField: 'first_name',
        },
        {
          title: translate('Email'),
          render: ({ row }) => <>{row.email}</>,
          export: 'email',
        },
        {
          title: translate('Cluster role'),
          render: ({ row }) => (
            <Badge
              variant={getKeycloakMembershipRoleColor(row.group_role)}
              outline
              pill
            >
              {row.group_role}
            </Badge>
          ),

          export: 'group_role',
        },
        {
          title: translate('Status'),
          render: ({ row }) =>
            row.state === 'active' ? (
              <Badge variant="success" outline pill>
                {translate('Active')}
              </Badge>
            ) : (
              <Badge variant="warning" outline pill>
                {translate('Pending')}
              </Badge>
            ),

          export: 'state',
        },
      ]}
      verboseName={translate('Keycloak user group membership')}
      hasQuery={true}
      enableExport
      showPageSizeSelector
      tableActions={
        <TableActions refetch={props.fetch} resource={resourceScope} />
      }
      enableMultiSelect
      multiSelectActions={BulkActions}
      rowActions={KeycloakMembershipRowActions}
      expandableRow={ExpandableRow}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
