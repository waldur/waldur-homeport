import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC, FunctionComponent, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  DuplicateOfferingCandidate,
  DuplicateOfferingGroup,
  marketplaceOpenstackDuplicateOfferingsList,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createClientPaginatedFetcher, createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { DropdownLink } from '../list/DropdownLink';

const EditOfferingAction = ({
  row,
  customerUuid,
}: {
  row: DuplicateOfferingCandidate;
  customerUuid: string | null;
}) => {
  const user = useUser();
  const canUpdate = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING,
    customerId: customerUuid,
  });
  if (!canUpdate) {
    return null;
  }
  return (
    <Dropdown.Item
      as={DropdownLink}
      state="admin-marketplace-offering-update"
      params={{ offering_uuid: row.uuid, uuid: customerUuid }}
    >
      <span className="svg-icon svg-icon-2">
        <PencilSimpleIcon weight="bold" />
      </span>
      {translate('Edit offering')}
    </Dropdown.Item>
  );
};

const DuplicateOfferingsExpandableRow: FC<{ row: DuplicateOfferingGroup }> = ({
  row: group,
}) => {
  const tableProps = useTable({
    table: `DuplicateOfferingCandidates-${group.tenant_id}-${group.offering_type}`,
    fetchData: createClientPaginatedFetcher(group.candidates),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [group.candidates]);

  return (
    <ExpandableContainer>
      <Table<DuplicateOfferingCandidate>
        {...tableProps}
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => (
              <Link
                state="admin-marketplace-offering-details"
                params={{ offering_uuid: row.uuid }}
              >
                {row.name}
              </Link>
            ),
          },
          {
            title: translate('State'),
            render: ({ row }) => <>{row.state}</>,
          },
          {
            title: translate('Active resources'),
            render: ({ row }) => <>{row.active_resources}</>,
          },
          {
            title: translate('Total resources'),
            render: ({ row }) => <>{row.total_resources}</>,
          },
          {
            title: translate('Recommended'),
            render: ({ row }) =>
              row.is_recommended_keeper ? (
                <Badge variant="primary" pill outline>
                  {translate('Keeper')}
                </Badge>
              ) : (
                <>{renderFieldOrDash(null)}</>
              ),
          },
        ]}
        verboseName={translate('Duplicate offerings')}
        rowActions={({ row }) => (
          <ActionsDropdown
            row={row}
            data={{ customerUuid: group.customer_uuid }}
            actions={[EditOfferingAction]}
          />
        )}
      />
    </ExpandableContainer>
  );
};

export const DuplicateOfferingsList: FunctionComponent = () => {
  const tableProps = useTable({
    table: 'DuplicateOfferings',
    fetchData: createFetcher(marketplaceOpenstackDuplicateOfferingsList),
  });

  return (
    <Table<DuplicateOfferingGroup>
      {...tableProps}
      columns={[
        {
          title: translate('Organization'),
          render: ({ row }) => <>{renderFieldOrDash(row.customer_name)}</>,
        },
        {
          title: translate('Tenant'),
          render: ({ row }) => (
            <>
              {renderFieldOrDash(row.tenant_name)}{' '}
              <span className="text-muted">#{row.tenant_id}</span>
            </>
          ),
        },
        {
          title: translate('Offering type'),
          render: ({ row }) => <>{row.offering_type}</>,
        },
        {
          title: translate('Duplicates'),
          render: ({ row }) => <>{row.candidates.length}</>,
        },
        {
          title: translate('Orphaned resources'),
          render: ({ row }) => <>{row.orphan_count}</>,
        },
      ]}
      title={translate('OpenStack duplicate offerings')}
      verboseName={translate('OpenStack duplicate offerings')}
      expandableRow={DuplicateOfferingsExpandableRow}
      enableExport
    />
  );
};
