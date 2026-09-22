import { useQueries } from '@tanstack/react-query';
import { FC } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { Project, projectsListUsersCount } from 'waldur-js-client';

import { getResourcesCount } from '@/administration/api';
import { fetchResultCount } from '@/core/api';
import { translate } from '@/i18n';
import { getStates } from '@/marketplace/resources/list/ResourceStateFilter';
import { canViewTeam } from '@/permissions/teamVisibility';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { useUser } from '@/workspace/hooks';

import { TableTabsContainer } from '../../customer/list/TableTabsContainer';

import { NavItem } from './OrganizationExpandableRow';
import { SummaryResourcesTable } from './SummaryResourcesTable';
import { SummaryTeamTable } from './SummaryTeamTable';

interface OwnProps {
  row: Project;
}

export const ProjectExpandableRow: FC<OwnProps> = (props) => {
  const user = useUser();
  const showTeam = canViewTeam(user, {
    customerId: props.row.customer_uuid,
    projectId: props.row.uuid,
  });
  const [resourcesCount, teamCount] = useQueries({
    queries: [
      {
        queryKey: ['resourcesCount', props.row.uuid],
        queryFn: () =>
          getResourcesCount({
            project_uuid: props.row.uuid,
            state: getStates().map((state) => state.value),
          }),
      },
      {
        queryKey: ['teamCount', props.row.uuid],
        queryFn: () =>
          projectsListUsersCount({
            path: { uuid: props.row.uuid },
          }).then(fetchResultCount),
        enabled: showTeam,
      },
    ],
  });
  return (
    <ExpandableContainer>
      <TableTabsContainer
        defaultActiveKey="resources"
        unmountOnExit={true}
        className="min-h-375px"
      >
        <div className="overflow-auto">
          <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
            <NavItem
              title={translate('Resources')}
              eventKey="resources"
              count={resourcesCount.data}
              countLoading={resourcesCount.isLoading}
            />

            {showTeam && (
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
          <Tab.Pane eventKey="resources">
            <SummaryResourcesTable scope={props.row} context="project" />
          </Tab.Pane>
          {showTeam && (
            <Tab.Pane eventKey="team">
              <SummaryTeamTable scope={props.row} context="project" />
            </Tab.Pane>
          )}
        </Tab.Content>
      </TableTabsContainer>
    </ExpandableContainer>
  );
};
