import { CaretDownIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, memo, useMemo } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  marketplaceOfferingRolesList,
  OfferingKeycloakMembership,
  offeringKeycloakMembershipsList,
  OfferingKeycloakMembershipsListData,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import Avatar from '@/core/Avatar';
import { Badge } from '@/core/Badge';
import { UI_STALE_TIME } from '@/core/constants';
import { formatDateTime } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { getUser } from '@/workspace/selectors';

import { AddKeycloakMembershipButton } from './AddKeycloakMembershipButton';
import { KeycloakMembershipBulkRemoveAction } from './KeycloakMembershipBulkRemoveAction';
import { KeycloakMembershipRowActions } from './KeycloakMembershipRowActions';
import { OfferingKeycloakMembershipExpandableRow } from './OfferingKeycloakMembershipExpandableRow';
import { getKeycloakMembershipRoleColor } from './utils';

const TableActions = ({
  refetch,
  resource,
  offering,
}: {
  refetch(): void;
  resource: Resource;
  offering: PublicOfferingDetails;
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
        <AddKeycloakMembershipButton
          refetch={refetch}
          resource={resource}
          offering={offering}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
};

const BulkActions = ({ rows, refetch }) => (
  <ActionDropdownButton variant="primary" title={translate('Actions')}>
    <KeycloakMembershipBulkRemoveAction rows={rows} refetch={refetch} />
  </ActionDropdownButton>
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

export const OfferingKeycloakMembershipList: FunctionComponent<{
  resource: Resource;
  resourceScope?: Resource;
  offering: PublicOfferingDetails;
  portal?: any;
}> = ({ resource, offering, portal }) => {
  const user = useSelector(getUser);
  const canManageUsers = hasPermission(user, {
    permission: PermissionEnum.MANAGE_RESOURCE_USERS,
    customerId: offering.customer_uuid,
  });

  const filter = useMemo(
    () =>
      ({
        offering_uuid: offering.uuid,
        resource_uuid: resource.uuid,
      }) satisfies OfferingKeycloakMembershipsListData['query'],
    [offering.uuid, resource.uuid],
  );

  const tableProps = useTable({
    table: 'offering-keycloak-memberships',
    fetchData: createFetcher(offeringKeycloakMembershipsList),
    filter,
    queryField: 'username',
  });

  // Fetch offering roles to determine if expandable rows are needed
  const { data: roles } = useQuery({
    queryKey: ['OfferingRoles', offering.uuid],
    queryFn: () =>
      getAllPages((page) =>
        marketplaceOfferingRolesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            offering_uuid: offering.uuid,
          },
        }),
      ),
    staleTime: UI_STALE_TIME,
  });

  const scopeTypes = useMemo(() => {
    if (!roles) return [];
    const seen = new Set<string>();
    return roles
      .filter(
        (r) =>
          r.content_type &&
          !seen.has(r.content_type) &&
          (seen.add(r.content_type), true),
      )
      .map((r) => ({
        key: r.content_type,
        label:
          r.content_type ||
          r.content_type.charAt(0).toUpperCase() + r.content_type.slice(1),
      }));
  }, [roles]);

  const hasExpandableRows = scopeTypes.length > 0;

  const ExpandableRow = useMemo(() => {
    if (!hasExpandableRows || !roles) return undefined;
    return memo((props: any) => (
      <OfferingKeycloakMembershipExpandableRow
        {...props}
        offering_uuid={offering.uuid}
        resource_uuid={resource.uuid}
        scopeTypes={scopeTypes}
        roles={roles}
      />
    ));
  }, [hasExpandableRows, roles, scopeTypes, offering.uuid, resource.uuid]);

  return (
    <Table<OfferingKeycloakMembership>
      {...tableProps}
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
          title: translate('Role'),
          render: ({ row }) => (
            <Badge
              variant={getKeycloakMembershipRoleColor(row.group_role_name)}
              pill
              outline
            >
              {row.group_role_name}
            </Badge>
          ),
          export: 'group_role_name',
        },
        {
          title: translate('Status'),
          render: ({ row }) => {
            const lastCheckedLabel = row.last_checked
              ? translate('Last checked: {date}', {
                  date: formatDateTime(row.last_checked),
                })
              : undefined;
            if (row.state === 'active') {
              const badge = (
                <Badge variant="success" pill outline>
                  {translate('Active')}
                </Badge>
              );
              return lastCheckedLabel ? (
                <Tip label={lastCheckedLabel} id={`checked-${row.uuid}`}>
                  {badge}
                </Tip>
              ) : (
                badge
              );
            }
            if (row.error_message) {
              const errorLabel =
                user?.is_staff && row.error_traceback
                  ? `${row.error_message}\n\n${row.error_traceback}`
                  : row.error_message;
              return (
                <Tip label={errorLabel} id={`error-${row.uuid}`}>
                  <Badge variant="danger" pill outline>
                    {translate('Error')}
                  </Badge>
                </Tip>
              );
            }
            return (
              <Badge variant="warning" pill outline>
                {translate('Pending')}
              </Badge>
            );
          },
          export: 'state',
        },
        {
          visible: false,
          title: translate('Created'),
          render: null,
          export: (row) => formatDateTime(row.created),
        },
        {
          visible: false,
          title: translate('Modified'),
          render: null,
          export: (row) => formatDateTime(row.modified),
        },
        {
          visible: false,
          title: translate('Last checked'),
          render: null,
          export: (row) => formatDateTime(row.last_checked),
        },
      ]}
      verboseName={translate('Keycloak user group membership')}
      hasQuery={true}
      enableExport
      showPageSizeSelector
      tableActions={
        canManageUsers ? (
          <TableActions
            refetch={tableProps.fetch}
            resource={resource}
            offering={offering}
          />
        ) : null
      }
      enableMultiSelect={canManageUsers}
      multiSelectActions={canManageUsers ? BulkActions : undefined}
      rowActions={canManageUsers ? KeycloakMembershipRowActions : undefined}
      expandableRow={ExpandableRow}
      title={translate('Roles')}
      portal={portal}
      hasActionBar={!portal}
      cardBordered={!portal}
      fullWidth={!!portal}
    />
  );
};
