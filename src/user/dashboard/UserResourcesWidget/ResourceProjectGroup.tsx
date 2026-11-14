import { ArrowRightIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { projectsListUsersList, projectsRetrieve } from 'waldur-js-client';

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
}

export const ResourceProjectGroup: FC<ResourceProjectGroupProps> = ({
  project,
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
      <div>
        <div className="text-base font-medium text-primary">
          {translate('Project')}: {project.name}
          <span className="text-quaternary ms-1.5 font-normal text-xs">
            ({translate('Organization')}: {project.customerName})
          </span>
        </div>
        <div className="text-quaternary text-sm">
          {translate('{count} resources', {
            count: project.resources.length,
          })}
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center py-3">
          <LoadingSpinnerSimple />
          <span className="ms-1.5 text-quaternary">
            {translate('Loading project details...')}
          </span>
        </div>
      ) : (
        (projectDetails?.description || hasTeamMembers) && (
          <div>
            {projectDetails?.description && (
              <p className="text-quaternary mb-2.5">
                {projectDetails.description}
              </p>
            )}
            {hasTeamMembers && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <SymbolsGroup
                    items={teamData.members}
                    max={MAX_TEAM_MEMBERS_DISPLAY}
                    length={teamData.totalCount}
                    size={32}
                    nameKey="user_full_name"
                    emailKey="user_email"
                    imageKey="user_image"
                  />
                  <span className="text-quaternary text-xs">
                    {translate('{count} team members', {
                      count: teamData.totalCount,
                    })}
                  </span>
                </div>
                <Link
                  state="project-team"
                  params={{ uuid: project.uuid }}
                  buttonVariant="text-primary"
                  buttonSize="sm"
                  className="p-0"
                >
                  {translate('View team')}
                  <ArrowRightIcon size={14} weight="bold" className="ms-1" />
                </Link>
              </div>
            )}
          </div>
        )
      )}
      {project.resources.map((resource) => (
        <ResourceQuickInfo key={resource.uuid} resource={resource} />
      ))}
    </section>
  );
};
