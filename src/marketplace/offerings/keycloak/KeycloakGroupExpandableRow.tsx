import { FC, useMemo } from 'react';
import {
  OfferingKeycloakGroup,
  OfferingKeycloakMembership,
  offeringKeycloakMembershipsList,
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

export const KeycloakGroupExpandableRow: FC<{
  row: OfferingKeycloakGroup;
}> = ({ row }) => {
  const filter = useMemo(() => ({ group_uuid: row.uuid }), [row.uuid]);

  const tableProps = useTable({
    table: 'keycloak-group-members-' + row.uuid,
    fetchData: createFetcher(offeringKeycloakMembershipsList),
    filter,
  });

  return (
    <ExpandableContainer>
      <Table<OfferingKeycloakMembership>
        {...tableProps}
        columns={[
          {
            title: translate('Username'),
            render: ({ row }) => row.username,
          },
          {
            title: translate('Name'),
            render: ({ row }) =>
              renderFieldOrDash(
                [row.first_name, row.last_name].filter(Boolean).join(' '),
              ),
          },
          {
            title: translate('Email'),
            render: ({ row }) => renderFieldOrDash(row.email),
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
          },
        ]}
        verboseName={translate('members')}
        rowActions={KeycloakMembershipRowActions}
        hasActionBar={false}
        fullWidth
      />
    </ExpandableContainer>
  );
};
