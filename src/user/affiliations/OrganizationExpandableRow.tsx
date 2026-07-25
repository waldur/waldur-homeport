import { useQueries, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import {
  ProjectsListData,
  projectsCount as fetchProjectsCount,
} from 'waldur-js-client';

import { getResourcesCount } from '@/administration/api';
import { fetchResultCount } from '@/core/api';
import { Badge } from '@/core/Badge';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getStates } from '@/marketplace/resources/list/ResourceStateFilter';
import { ResourceMultiSelectAction } from '@/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { BatchProjectActions } from '@/project/BatchProjectActions';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import {
  ExpandableRowToolbar,
  ExpandableRowToolbarColumn,
} from '@/table/ExpandableRowToolbar';
import { useUser } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

import { TableTabsContainer } from '../../customer/list/TableTabsContainer';
import { getCustomerUsersCount } from '../../customer/team/utils';

import { SummaryOrganizationProjects } from './SummaryOrganizationProjects';
import { SummaryResourcesTable } from './SummaryResourcesTable';
import { SummaryTeamTable } from './SummaryTeamTable';

// Toggleable columns for the Projects tab. Mirrors the optional columns
// configured in SummaryOrganizationProjects via the optionalColumns prop.
const getProjectsOptionalColumns = (): ExpandableRowToolbarColumn[] => [
  {
    id: 'description',
    title: translate('Description'),
    keys: ['description'],
  },
  {
    id: 'created',
    title: translate('Created'),
    keys: ['created'],
  },
];

export const NavItem = ({ title, eventKey, count, countLoading }) => (
  <Nav.Item className="text-nowrap">
    <Nav.Link eventKey={eventKey}>
      {title}
      <Badge variant="default" pill outline className="ms-2">
        {countLoading ? <LoadingSpinnerSimple /> : count || 0}
      </Badge>
    </Nav.Link>
  </Nav.Item>
);

interface OwnProps {
  row: Customer;
}

export const OrganizationExpandableRow: FC<OwnProps> = (props) => {
  const user = useUser();
  const [activeTab, setActiveTab] = useState<string>('projects');
  const canListUsers =
    hasPermission(user, {
      permission: PermissionEnum.LIST_CUSTOMER_USERS,
      customerId: props.row.uuid,
    }) || user.is_support;

  // Per-tab Redux table key + bulk actions component + toggleable columns
  const { activeTableKey, activeMultiSelectActions, activeOptionalColumns } =
    useMemo(() => {
      if (activeTab === 'projects') {
        return {
          activeTableKey: `SummaryOrganizationProjects-${props.row.uuid}`,
          activeMultiSelectActions: BatchProjectActions,
          activeOptionalColumns: getProjectsOptionalColumns(),
        };
      }
      if (activeTab === 'resources') {
        return {
          activeTableKey: `OrganizationResources-${props.row.uuid}`,
          activeMultiSelectActions: ResourceMultiSelectAction,
          activeOptionalColumns: undefined,
        };
      }
      return {
        activeTableKey: null,
        activeMultiSelectActions: null,
        activeOptionalColumns: undefined,
      };
    }, [activeTab, props.row.uuid]);
  const [projectsCount, resourcesCount, teamCount] = useQueries({
    queries: [
      {
        queryKey: ['projectsCount', props.row.uuid],
        queryFn: () =>
          fetchProjectsCount({
            query: {
              customer: [props.row.uuid],
            } satisfies ProjectsListData['query'],
          }).then(fetchResultCount),
      },
      {
        queryKey: ['resourcesCount', props.row.uuid],
        queryFn: () =>
          getResourcesCount({
            customer_uuid: props.row.uuid,
            state: getStates().map((state) => state.value),
          }),
      },
      ...(canListUsers
        ? [
            {
              queryKey: ['teamCount', props.row.uuid],
              queryFn: () => getCustomerUsersCount(props.row.uuid),
            },
          ]
        : []),
    ],
  });
  // A bulk move touches two orgs (source + destination) and a delete touches
  // one, but any number of org rows can be expanded at once — each caching its
  // own count badges and inner tables keyed by org uuid — and the parent list
  // caches a `projects_count` column of its own. We can't know from here which
  // orgs are affected, so invalidate every project-membership-derived query;
  // React Query only refetches the ones with mounted observers, so on-screen
  // rows refresh and the rest are simply marked stale for their next expand.
  const queryClient = useQueryClient();
  const refetchAffectedData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['projectsCount'] });
    queryClient.invalidateQueries({ queryKey: ['resourcesCount'] });
    queryClient.invalidateQueries({ queryKey: ['teamCount'] });
    queryClient.invalidateQueries({ queryKey: ['table', 'customerList'] });
    // Inner projects/resources tables are keyed `<TableId>-<uuid>`, so a plain
    // key prefix can't reach every org's copy — match them by id prefix.
    queryClient.invalidateQueries({
      predicate: ({ queryKey }) =>
        queryKey[0] === 'table' &&
        typeof queryKey[1] === 'string' &&
        (queryKey[1].startsWith('SummaryOrganizationProjects-') ||
          queryKey[1].startsWith('OrganizationResources-')),
    });
  }, [queryClient]);
  return (
    <ExpandableContainer>
      <div className="card card-table card-bordered overflow-auto">
        <ExpandableRowToolbar
          activeTableKey={activeTableKey}
          multiSelectActions={activeMultiSelectActions}
          optionalColumns={activeOptionalColumns}
          onRefetch={refetchAffectedData}
        />
        <TableTabsContainer
          defaultActiveKey="projects"
          activeKey={activeTab}
          onSelect={(k) => k && setActiveTab(k)}
          unmountOnExit={true}
          className="min-h-375px"
        >
          <div className="overflow-auto">
            <Nav
              variant="tabs"
              className="nav-line-tabs flex-nowrap border-start-0 border-end-0 rounded-0"
            >
              <NavItem
                title={translate('Projects')}
                eventKey="projects"
                count={projectsCount.data}
                countLoading={projectsCount.isLoading}
              />

              <NavItem
                title={translate('Resources')}
                eventKey="resources"
                count={resourcesCount.data}
                countLoading={resourcesCount.isLoading}
              />

              {canListUsers && (
                <NavItem
                  title={translate('Team')}
                  eventKey="team"
                  count={teamCount.data}
                  countLoading={teamCount.isLoading}
                />
              )}
            </Nav>
          </div>
          <Tab.Content className="overflow-auto">
            <Tab.Pane eventKey="projects" unmountOnExit={true}>
              <SummaryOrganizationProjects customer={props.row} />
            </Tab.Pane>
            <Tab.Pane eventKey="resources" unmountOnExit={true}>
              <SummaryResourcesTable scope={props.row} context="organization" />
            </Tab.Pane>
            <Tab.Pane eventKey="team" unmountOnExit={true}>
              <SummaryTeamTable scope={props.row} context="organization" />
            </Tab.Pane>
          </Tab.Content>
        </TableTabsContainer>
      </div>
    </ExpandableContainer>
  );
};
