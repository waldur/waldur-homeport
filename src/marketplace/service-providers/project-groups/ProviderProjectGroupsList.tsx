import { ArrowsClockwiseIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import {
  marketplaceServiceProviderProjectGroupsList,
  ServiceProvider,
  ServiceProviderProjectGroup,
  User,
} from 'waldur-js-client';

import { Badge, HelpIcon } from 'waldur-ui';

import { CreateModalButton } from '@/core/buttons';
import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { Link } from '@/core/Link';
import { OWN_ERROR_STATE, retryServerErrors } from '@/core/queryRetry';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { CustomerResourcesListPlaceholder } from '@/marketplace/resources/list/CustomerResourcesListPlaceholder';
import { useModal } from '@/modal/actions';
import { NoResult } from '@/navigation/header/search/NoResult';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import {
  MarketplaceServiceProviderProjectGroupsFilter,
  MarketplaceServiceProviderProjectGroupsFilterFormId,
  selectMarketplaceServiceProviderProjectGroupsFilter,
} from '@/table/generated/MarketplaceServiceProviderProjectGroupsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { ProjectGroupMembers } from './ProjectGroupMembers';
import { canManageProjectGroups } from './utils';

const AdoptProjectGroupDialog = lazyComponent(() =>
  import('./AdoptProjectGroupDialog').then((module) => ({
    default: module.AdoptProjectGroupDialog,
  })),
);

const ChangeProjectGroupGidDialog = lazyComponent(() =>
  import('./ChangeProjectGroupGidDialog').then((module) => ({
    default: module.ChangeProjectGroupGidDialog,
  })),
);

const ImportProjectGroupsDialog = lazyComponent(() =>
  import('./ImportProjectGroupsDialog').then((module) => ({
    default: module.ImportProjectGroupsDialog,
  })),
);

const TABLE_ID = 'marketplace-provider-project-groups';

const NO_GID_EXPLANATION = () =>
  translate(
    'No pool range can supply a GID yet. The group gets one as soon as a range can.',
  );

// The provider's people do not necessarily have a role in the project, and
// the project page would turn them away.
const canOpenProject = (user: User, group: ServiceProviderProjectGroup) =>
  Boolean(
    user.is_staff ||
    user.is_support ||
    user.permissions?.some(
      (permission) =>
        permission.scope_uuid === group.project_uuid ||
        permission.scope_uuid === group.customer_uuid,
    ),
  );

export const ChangeGidAction: FC<{
  row: ServiceProviderProjectGroup;
  refetch: () => void;
}> = ({ row, refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={row.gid == null ? translate('Set GID') : translate('Change GID')}
      action={() =>
        openDialog(ChangeProjectGroupGidDialog, {
          resolve: { group: row, refetch },
        })
      }
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};

const WHAT_THEY_ARE = () =>
  translate(
    'A project group is the one POSIX group a project gets at this service provider, with a stable GID and the project members’ accounts as its members. Clusters grant access through it, and files on shared storage are owned by it.',
  );

// Only those who can set project groups up are told how; for everyone else
// the list may be empty because they see no groups, not because there are
// none.
const EmptyState: FC<{ canManage: boolean; actions?: ReactNode }> = ({
  canManage,
  actions,
}) =>
  canManage ? (
    <NoResult
      title={translate('No project groups yet')}
      message={
        <>
          <p className="mb-2">{WHAT_THEY_ARE()}</p>
          <p className="mb-0">
            {translate(
              'To start: set a project group GID range on the POSIX ID pool, adopt the groups your directory already holds, then enable project groups in the account settings.',
            )}
          </p>
          {/* The switch lives on the account settings page, which has its
              own feature flag. */}
          {!isFeatureVisible(MarketplaceFeatures.show_provider_accounts) && (
            <p className="mb-0 mt-2">
              {translate(
                'Account settings are not enabled on this portal; ask its administrator to turn on provider accounts so project groups can be switched on.',
              )}
            </p>
          )}
        </>
      }
      actions={actions}
    />
  ) : (
    <NoResult
      title={translate('No project groups to show')}
      message={<p className="mb-0">{WHAT_THEY_ARE()}</p>}
      noAction
    />
  );

interface ProviderProjectGroupsListProps {
  provider?: ServiceProvider;
}

const ProjectGroupsTable: FC<{ provider: ServiceProvider }> = ({
  provider,
}) => {
  const user = useUser();
  const canManage = canManageProjectGroups(user, provider.customer_uuid);
  const filterValues = useFilterValues(TABLE_ID);
  const filter = useMemo(
    () => ({
      service_provider_uuid: provider.uuid,
      ...selectMarketplaceServiceProviderProjectGroupsFilter(filterValues),
    }),
    [provider.uuid, filterValues],
  );
  const tableProps = useTable({
    table: TABLE_ID,
    fetchData: createFetcher(marketplaceServiceProviderProjectGroupsList),
    filter,
    queryField: 'query',
    // A failing server shows the error view after one retry, not seconds of
    // spinner, and in place: no redirect to the error page.
    retry: retryServerErrors(1),
    meta: OWN_ERROR_STATE,
  });
  const isFiltered = Boolean(
    tableProps.query || filter.in_use !== undefined || filter.offering_uuid,
  );

  const ExpandableRow = useCallback(
    ({ row }: { row: ServiceProviderProjectGroup }) => (
      <ProjectGroupMembers members={row.members} />
    ),
    [],
  );

  const RowActions = useCallback(
    ({ row }: { row: ServiceProviderProjectGroup }) => (
      <ActionsDropdown row={row} refetch={tableProps.fetch}>
        <ChangeGidAction row={row} refetch={tableProps.fetch} />
      </ActionsDropdown>
    ),
    [tableProps.fetch],
  );

  const resolve = useMemo(
    () => ({ provider, refetch: tableProps.fetch }),
    [provider, tableProps.fetch],
  );
  const actions = canManage ? (
    <>
      <CreateModalButton
        dialog={ImportProjectGroupsDialog}
        resolve={resolve}
        title={translate('Import groups')}
        iconNode={<UploadSimpleIcon weight="bold" />}
        variant="tertiary"
      />
      <CreateModalButton
        dialog={AdoptProjectGroupDialog}
        resolve={resolve}
        title={translate('Adopt existing group')}
      />
    </>
  ) : undefined;

  const columns = useMemo(
    () => [
      {
        title: translate('Name'),
        render: ({ row }: { row: ServiceProviderProjectGroup }) => (
          <code>{row.name}</code>
        ),
        orderField: 'name',
        copyField: (row: ServiceProviderProjectGroup) => row.name,
      },
      {
        title: translate('GID'),
        render: ({ row }: { row: ServiceProviderProjectGroup }) =>
          row.gid == null ? (
            <span className="d-inline-flex align-items-center gap-1 text-muted">
              {translate('Not assigned')}
              <HelpIcon label={NO_GID_EXPLANATION()} size={14} />
            </span>
          ) : (
            <>{row.gid}</>
          ),
        orderField: 'gid',
        copyField: (row: ServiceProviderProjectGroup) =>
          row.gid == null ? '' : String(row.gid),
      },
      {
        title: translate('Project'),
        render: ({ row }: { row: ServiceProviderProjectGroup }) =>
          row.project_uuid == null ? (
            <span className="text-muted">{translate('Deleted project')}</span>
          ) : canOpenProject(user, row) ? (
            <Link
              state="project.dashboard"
              params={{ uuid: row.project_uuid }}
              label={row.project_name}
            />
          ) : (
            <>{row.project_name}</>
          ),
      },
      {
        title: translate('Organization'),
        render: ({ row }: { row: ServiceProviderProjectGroup }) =>
          renderFieldOrDash(row.customer_name),
      },
      {
        title: translate('Offerings'),
        render: ({ row }: { row: ServiceProviderProjectGroup }) =>
          renderFieldOrDash(
            row.offerings.map((offering) => offering.name).join(', '),
          ),
      },
      {
        title: translate('Members'),
        render: ({ row }: { row: ServiceProviderProjectGroup }) => (
          <>{row.members.length}</>
        ),
      },
      {
        title: translate('Status'),
        render: ({ row }: { row: ServiceProviderProjectGroup }) =>
          row.in_use ? (
            <Badge variant="success" tone="light">
              {translate('In use')}
            </Badge>
          ) : (
            <Badge variant="neutral" tone="light">
              {translate('Not in use')}
            </Badge>
          ),
      },
      {
        title: translate('Created'),
        render: ({ row }: { row: ServiceProviderProjectGroup }) => (
          <>{formatDateTime(row.created)}</>
        ),
        orderField: 'created',
      },
    ],
    [user],
  );

  return (
    <Table<ServiceProviderProjectGroup>
      {...tableProps}
      columns={columns}
      title={translate('Project groups')}
      verboseName={translate('project groups')}
      hasQuery
      filters={
        <MarketplaceServiceProviderProjectGroupsFilter
          customerUuid={provider.customer_uuid}
        />
      }
      formId={MarketplaceServiceProviderProjectGroupsFilterFormId}
      expandableRow={ExpandableRow}
      rowActions={canManage ? RowActions : undefined}
      tableActions={actions}
      placeholderComponent={
        isFiltered ? undefined : (
          <EmptyState canManage={canManage} actions={actions} />
        )
      }
      initialSorting={{ field: 'name', mode: 'asc' }}
      showPageSizeSelector
    />
  );
};

/** The POSIX groups the provider holds, one per project using its offerings. */
export const ProviderProjectGroupsList: FC<ProviderProjectGroupsListProps> = ({
  provider,
}) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProjectGroupsTable provider={provider} />;
};
