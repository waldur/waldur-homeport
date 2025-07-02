import { useQueries } from '@tanstack/react-query';
import { FC } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { ProjectsListData } from 'waldur-js-client';

import { getResourcesCount } from '@waldur/administration/api';
import { count } from '@waldur/core/api';
import { Badge } from '@waldur/core/Badge';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getStates } from '@waldur/marketplace/resources/list/ResourceStateFilter';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { TableTabsContainer } from '../../customer/list/TableTabsContainer';
import { getCustomerUsersCount } from '../../customer/team/utils';

import { SummaryOrganizationProjects } from './SummaryOrganizationProjects';
import { SummaryResourcesTable } from './SummaryResourcesTable';
import { SummaryTeamTable } from './SummaryTeamTable';

export const NavItem = ({ title, eventKey, count, countLoading }) => (
  <Nav.Item className="text-nowrap">
    <Nav.Link eventKey={eventKey}>
      {title}
      <Badge variant="default" outline pill className="ms-2">
        {countLoading ? <LoadingSpinnerIcon /> : count || 0}
      </Badge>
    </Nav.Link>
  </Nav.Item>
);

interface OwnProps {
  row: Customer;
}

export const OrganizationExpandableRow: FC<OwnProps> = (props) => {
  const user = useSelector(getUser);
  const canListUsers =
    hasPermission(user, {
      permission: PermissionEnum.LIST_CUSTOMER_USERS,
      customerId: props.row.uuid,
    }) || user.is_support;
  const [projectsCount, resourcesCount, teamCount] = useQueries({
    queries: [
      {
        queryKey: ['projectsCount', props.row.uuid],
        queryFn: () =>
          count(`/api/projects/`, {
            customer: [props.row.uuid],
          } satisfies ProjectsListData['query']),
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
  return (
    <ExpandableContainer>
      <TableTabsContainer
        defaultActiveKey="projects"
        unmountOnExit={true}
        className="min-h-375px"
      >
        <div className="overflow-auto">
          <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
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
    </ExpandableContainer>
  );
};
