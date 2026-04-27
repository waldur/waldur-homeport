import { ArrowRightIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { projectsListUsersList, projectsRetrieve } from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { fetchResultCount } from '@/core/api';
import { STALE_TIME } from '@/core/constants';
import { Link } from '@/core/Link';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { SymbolsGroup } from '@/customer/dashboard/SymbolsGroup';
import { translate } from '@/i18n';

import { ResourceQuickInfo } from './ResourceQuickInfo';
import { ProjectInfo } from './utils';

const MAX_TEAM_MEMBERS_DISPLAY = 5;

interface ResourceProjectGroupProps {
  project: ProjectInfo;
  defaultOpen?: boolean;
}

export const ResourceProjectGroup: FC<ResourceProjectGroupProps> = ({
  project,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Lazy load project details when accordion is opened
  const { data: projectDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['project-details-onboarding', project.uuid],
    queryFn: async () => {
      const response = await projectsRetrieve({
        path: { uuid: project.uuid },
      });
      return response.data;
    },
    enabled: isOpen,
    staleTime: STALE_TIME, // Cache for 5 minutes
  });

  // Lazy load team members when accordion is opened
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
    enabled: isOpen,
    staleTime: STALE_TIME,
  });

  const title = (
    <span>
      {translate('Project')}: {project.name}
      <span className="text-muted ms-2 fw-normal fs-7">
        ({translate('Organization')}: {project.customerName})
      </span>
    </span>
  );

  const isLoading = isLoadingDetails || isLoadingTeam;
  const hasTeamMembers = teamData?.members?.length > 0;

  return (
    <AccordionCard
      title={title}
      subtitle={translate('{count} resources', {
        count: project.resources.length,
      })}
      isOpen={isOpen}
      onToggle={setIsOpen}
      className="mb-4"
    >
      {isLoading ? (
        <div className="d-flex align-items-center justify-content-center py-4">
          {}
          <LoadingSpinnerSimple />
          <span className="ms-2 text-muted">
            {translate('Loading project details...')}
          </span>
        </div>
      ) : (
        <>
          {/* Project summary section */}
          {(projectDetails?.description || hasTeamMembers) && (
            <div className="border rounded p-4 mb-4">
              {projectDetails?.description && (
                <p className="text-muted mb-3">{projectDetails.description}</p>
              )}
              {hasTeamMembers && (
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <SymbolsGroup
                      items={teamData.members}
                      max={MAX_TEAM_MEMBERS_DISPLAY}
                      length={teamData.totalCount}
                      size={32}
                      nameKey="user_full_name"
                      emailKey="user_email"
                      imageKey="user_image"
                    />
                    <span className="text-muted fs-7">
                      {translate('{count} team members', {
                        count: teamData.totalCount,
                      })}
                    </span>
                  </div>
                  <Link
                    state="project-team"
                    params={{ uuid: project.uuid }}
                    className="btn btn-sm btn-link text-primary p-0"
                  >
                    {translate('View team')}
                    <ArrowRightIcon size={14} weight="bold" className="ms-1" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Resources list */}
          {project.resources.map((resource) => (
            <ResourceQuickInfo key={resource.uuid} resource={resource} />
          ))}
        </>
      )}
    </AccordionCard>
  );
};
