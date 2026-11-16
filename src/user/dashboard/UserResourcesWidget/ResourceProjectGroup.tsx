import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { projectsListUsersList, projectsRetrieve } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { fetchResultCount } from '@/core/api';
import { STALE_TIME } from '@/core/constants';
import { Link } from '@/core/Link';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { SymbolsGroup } from '@/customer/dashboard/SymbolsGroup';
import { translate } from '@/i18n';
import { canViewTeam } from '@/permissions/teamVisibility';
import { useUser } from '@/workspace/hooks';

import { ResourceQuickInfo } from './ResourceQuickInfo';
import { ProjectInfo } from './utils';

const MAX_TEAM_MEMBERS_DISPLAY = 5;

interface ResourceProjectGroupProps {
  project: ProjectInfo;
  /** The project's tab already names it and counts its resources. */
  inTab?: boolean;
}

export const ResourceProjectGroup: FC<ResourceProjectGroupProps> = ({
  project,
  inTab,
}) => {
  const user = useUser();
  const showTeam = canViewTeam(user, {
    customerId: project.customerUuid,
    projectId: project.uuid,
  });

  // Load project details
  const { data: projectDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['project-details-onboarding', project.uuid],
    queryFn: async () => {
      const response = await projectsRetrieve({
        path: { uuid: project.uuid },
      });
      return response.data;
    },
    staleTime: STALE_TIME, // Cache for 5 minutes
  });

  // Load team members
  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['project-team-onboarding', project.uuid],
    queryFn: async () => {
      const response = await projectsListUsersList({
        path: { uuid: project.uuid },
        query: {
          field: [
            'user_uuid',
            'user_full_name',
            'user_email',
            'user_image',
            'role_name',
          ],
          page_size: MAX_TEAM_MEMBERS_DISPLAY + 1, // Fetch one extra to know if there are more
        },
      });
      // Get total count from response headers if available
      const count = fetchResultCount(response as any);
      const totalCount = !Number.isNaN(count)
        ? count
        : response.data?.length || 0;
      return {
        members: response.data || [],
        totalCount,
      };
    },
    enabled: showTeam,
    staleTime: STALE_TIME,
  });

  const isLoading = isLoadingDetails || isLoadingTeam;
  const hasTeamMembers = teamData?.members?.length > 0;

  return (
    <section className="flex flex-col gap-3">
      <div className="text-sm">
        <PropertyList variant="summary" termWidth="sm" space={1.5} hideIfEmpty>
          {!inTab && (
            <PropertyItem label={translate('Project')} value={project.name} />
          )}
          <PropertyItem
            label={translate('Organization')}
            value={project.customerName}
          />
          {!inTab && (
            <PropertyItem
              label={translate('Resources')}
              value={project.resources.length}
            />
          )}
          <PropertyItem
            label={translate('Description')}
            value={projectDetails?.description}
          />
          <PropertyItem
            label={translate('Team')}
            value={
              hasTeamMembers && (
                <span className="flex items-center gap-2.5">
                  <SymbolsGroup
                    items={teamData.members}
                    max={MAX_TEAM_MEMBERS_DISPLAY}
                    length={teamData.totalCount}
                    size={32}
                    nameKey="user_full_name"
                    emailKey="user_email"
                    imageKey="user_image"
                  />
                  <span className="text-quaternary">
                    {translate('{count} team members', {
                      count: teamData.totalCount,
                    })}
                  </span>
                  <Link
                    state="project-team"
                    params={{ uuid: project.uuid }}
                    label={translate('View team')}
                  />
                </span>
              )
            }
          />
        </PropertyList>
      </div>
      {isLoading && (
        <div className="flex items-center py-3">
          <LoadingSpinnerSimple />
          <span className="ms-1.5 text-quaternary">
            {translate('Loading project details...')}
          </span>
        </div>
      )}
      {project.resources.map((resource) => (
        <ResourceQuickInfo key={resource.uuid} resource={resource} />
      ))}
    </section>
  );
};
