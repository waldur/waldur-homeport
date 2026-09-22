import { GitMergeIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, FunctionComponent, useEffect } from 'react';
import {
  DuplicateOfferingCandidate,
  DuplicateOfferingGroup,
  marketplaceOpenstackDuplicateOfferingsList,
  OfferingMergeIssue,
} from 'waldur-js-client';

import { AlertItem, Badge, Tooltip } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { DropdownLink } from '@/marketplace/offerings/list/DropdownLink';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown, ActionsDropdownItem } from '@/table/ActionsDropdown';
import { createClientPaginatedFetcher, createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { WIZARD_STATE } from './constants';
import { useCanManageMerges } from './hooks';

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
    // asChild so the row *is* the link: Radix merges its menuitem
    // semantics and keyboard handling onto DropdownLink's own anchor
    // instead of nesting an anchor inside a menuitem div.
    <ActionsDropdownItem asChild>
      <DropdownLink
        state="admin-marketplace-offering-update"
        params={{ offering_uuid: row.uuid, uuid: customerUuid }}
      >
        <span className="svg-icon svg-icon-2">
          <PencilSimpleIcon weight="bold" />
        </span>
        {translate('Edit offering')}
      </DropdownLink>
    </ActionsDropdownItem>
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

  const issues = [
    ...group.blockers.map((issue) => ({ issue, variant: 'error' as const })),
    ...group.warnings.map((issue) => ({ issue, variant: 'warning' as const })),
  ];
  return (
    <ExpandableContainer>
      {issues.length > 0 && (
        <div className="d-flex flex-column gap-2 mb-4">
          {issues.map(({ issue, variant }, index) => (
            <AlertItem
              key={`${issue.code}-${index}`}
              variant={variant}
              title={
                <>
                  {issue.message} <code className="fs-8">{issue.code}</code>
                </>
              }
            />
          ))}
        </div>
      )}
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
                <Badge variant="primary" shape="pill" tone="outline">
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

/**
 * The wizard pre-fill for a duplicate group: the keeper becomes the target,
 * every other offering of the group a source, and the group's suggested
 * mapping pre-fills the plans and components.
 */
export const getDuplicateGroupSelection = (group: DuplicateOfferingGroup) => ({
  target: group.keeper_uuid,
  sources: group.duplicate_uuids ?? [],
  mapping: group.suggested_mapping,
});

const IssueCount: FC<{
  issues: OfferingMergeIssue[];
  variant: 'danger' | 'warning';
}> = ({ issues, variant }) =>
  issues.length === 0 ? (
    <>{issues.length}</>
  ) : (
    <Tooltip
      label={
        <ul className="mb-0 ps-4 text-start">
          {issues.map((issue, index) => (
            <li key={`${issue.code}-${index}`}>{issue.message}</li>
          ))}
        </ul>
      }
    >
      <Badge variant={variant} shape="pill" tone="light">
        {issues.length}
      </Badge>
    </Tooltip>
  );

const ResolveDuplicatesAction = ({ row }: { row: DuplicateOfferingGroup }) => {
  const router = useRouter();
  const canManage = useCanManageMerges();
  if (!canManage) {
    return null;
  }
  const { target, sources, mapping } = getDuplicateGroupSelection(row);
  const reason = !target
    ? translate('The group has no recommended keeper.')
    : sources.length === 0
      ? translate('The group has no duplicates left to merge.')
      : undefined;
  return (
    <ActionItem
      title={translate('Resolve in merge wizard')}
      iconNode={<GitMergeIcon weight="bold" />}
      disabled={Boolean(reason)}
      tooltip={reason}
      action={() =>
        router.stateService.go(WIZARD_STATE, {
          target,
          sources: sources.join(','),
          mapping,
        })
      }
    />
  );
};

export const DuplicateOfferingGroupsList: FunctionComponent = () => {
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
          render: ({ row }) => <>{row.duplicate_uuids.length}</>,
        },
        {
          title: translate('Blockers'),
          render: ({ row }) => (
            <IssueCount issues={row.blockers} variant="danger" />
          ),
        },
        {
          title: translate('Warnings'),
          render: ({ row }) => (
            <IssueCount issues={row.warnings} variant="warning" />
          ),
        },
        {
          title: translate('Orphaned resources'),
          render: ({ row }) => <>{row.orphan_count}</>,
        },
      ]}
      title={translate('OpenStack duplicate offerings')}
      subtitle={translate(
        'Tenants with more than one offering of a type. Resolve a group to merge its duplicates into the recommended keeper; blockers and warnings are those of that merge with the suggested mapping.',
      )}
      verboseName={translate('OpenStack duplicate offerings')}
      expandableRow={DuplicateOfferingsExpandableRow}
      rowActions={({ row }) => (
        <ActionsDropdown
          row={row}
          refetch={tableProps.fetch}
          actions={[ResolveDuplicatesAction]}
        />
      )}
      enableExport
    />
  );
};
