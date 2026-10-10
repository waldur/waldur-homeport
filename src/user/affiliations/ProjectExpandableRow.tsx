import { useQueries } from '@tanstack/react-query';
import { FC } from 'react';
import { Project, projectsListUsersCount } from 'waldur-js-client';

import { getResourcesCount } from '@/administration/api';
import { fetchResultCount } from '@/core/api';
import { translate } from '@/i18n';
import { getStates } from '@/marketplace/resources/list/ResourceStateFilter';
import { canViewTeam } from '@/permissions/teamVisibility';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { useUser } from '@/workspace/hooks';

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
      <EmbeddedTabs
        framed
        defaultValue="resources"
        className="min-h-375px"
        tabs={[
          {
            key: 'resources',
            title: translate('Resources'),
            count: resourcesCount.data,
            countLoading: resourcesCount.isLoading,
            content: (
              <SummaryResourcesTable scope={props.row} context="project" />
            ),
          },
          {
            key: 'team',
            title: translate('Team'),
            count: teamCount.data,
            countLoading: teamCount.isLoading,
            hidden: !showTeam,
            content: <SummaryTeamTable scope={props.row} context="project" />,
          },
        ]}
      />
    </ExpandableContainer>
  );
};
