import { FC, useMemo } from 'react';
import {
  OfferingKeycloakMembership,
  offeringKeycloakMembershipsList,
  OfferingUserRole,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { KeycloakMembershipRowActions } from './KeycloakMembershipRowActions';
import { getKeycloakMembershipRoleColor } from './utils';

interface ScopeTypeInfo {
  key: string;
  label: string;
}

interface ExpandableRowProps {
  row: OfferingKeycloakMembership;
  offering_uuid: string;
  resource_uuid?: string;
  scopeTypes: ScopeTypeInfo[];
  roles: OfferingUserRole[];
}

const ScopeTypeTable: FC<{
  row: OfferingKeycloakMembership;
  offering_uuid: string;
  resource_uuid?: string;
  scopeType: ScopeTypeInfo;
  roles: OfferingUserRole[];
}> = ({ row, offering_uuid, resource_uuid, scopeType, roles }) => {
  const scopeRoleUuids = useMemo(
    () =>
      roles.filter((r) => r.scope_type === scopeType.key).map((r) => r.uuid),
    [roles, scopeType.key],
  );

  const filter = useMemo(
    () => ({
      offering_uuid,
      resource_uuid,
      username: row.username,
      role_uuid: scopeRoleUuids,
    }),
    [offering_uuid, resource_uuid, row.username, scopeRoleUuids],
  );

  const props = useTable({
    table: `offering-keycloak-memberships-${row.uuid}-${scopeType.key}`,
    fetchData: createFetcher(offeringKeycloakMembershipsList),
    filter,
  });

  return (
    <Table<OfferingKeycloakMembership>
      {...props}
      title={scopeType.label}
      columns={[
        {
          title: translate('{scope} name', { scope: scopeType.label }),
          render: ({ row }) => renderFieldOrDash(row.group_resource_name),
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
          render: ({ row }) =>
            row.state === 'active' ? (
              <Badge variant="success" pill outline>
                {translate('Active')}
              </Badge>
            ) : row.error_message ? (
              <Tip label={row.error_message} id={`error-${row.uuid}`}>
                <Badge variant="danger" pill outline>
                  {translate('Error')}
                </Badge>
              </Tip>
            ) : (
              <Badge variant="warning" pill outline>
                {translate('Pending')}
              </Badge>
            ),
          export: 'state',
        },
      ]}
      verboseName={translate('memberships')}
      rowActions={KeycloakMembershipRowActions}
      hasActionBar={false}
      fullWidth
    />
  );
};

export const OfferingKeycloakMembershipExpandableRow: FC<
  ExpandableRowProps
> = ({ row, offering_uuid, resource_uuid, scopeTypes, roles }) => (
  <ExpandableContainer hasMultiSelect>
    {scopeTypes.map((scopeType) => (
      <ScopeTypeTable
        key={scopeType.key}
        row={row}
        offering_uuid={offering_uuid}
        resource_uuid={resource_uuid}
        scopeType={scopeType}
        roles={roles}
      />
    ))}
  </ExpandableContainer>
);
