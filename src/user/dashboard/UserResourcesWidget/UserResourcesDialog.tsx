import { RocketLaunchIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { marketplaceResourcesList } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { fetchResultCount } from '@/core/api';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { FixedHeightTabs } from '@/proposals/workflow-description/FixedHeightTabs';
import { router } from '@/router';

import { ResourceProjectGroup } from './ResourceProjectGroup';
import { ACTIVE_RESOURCE_STATES, groupResourcesByProject } from './utils';

const MAX_RESOURCES_DISPLAY = 5;

export const UserResourcesDialog: FC = () => {
  const { closeDialog } = useModal();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-resources-onboarding'],
    queryFn: async () => {
      const response = await marketplaceResourcesList({
        query: {
          state: ACTIVE_RESOURCE_STATES,
          page_size: MAX_RESOURCES_DISPLAY,
        },
      });
      const totalCount = fetchResultCount(response);
      return {
        projects: groupResourcesByProject(response.data),
        totalCount,
        hasMore: totalCount > MAX_RESOURCES_DISPLAY,
      };
    },
  });

  const handleViewAllResources = () => {
    closeDialog();
    router.stateService.go('all-resources');
  };

  const showingNote =
    data?.hasMore &&
    translate('Showing {displayed} of {total} resources', {
      displayed: MAX_RESOURCES_DISPLAY,
      total: data.totalCount,
    });

  return (
    <ModalDialog
      title={translate('Getting Started with Your Resources')}
      subtitle={translate(
        'Learn how to access and use your allocated resources',
      )}
      iconNode={<RocketLaunchIcon weight="bold" />}
      iconColor="info"
      footer={
        <>
          {showingNote && (
            <span className="text-quaternary me-auto hidden sm:block">
              {showingNote}
            </span>
          )}
          <CloseDialogButton />
          <BaseButton
            onClick={handleViewAllResources}
            label={translate('View all resources')}
            variant="primary"
            size="lg"
          />
        </>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-danger">
          {translate('Failed to load resources. Please try again.')}
        </div>
      ) : data?.projects?.length === 0 ? (
        <div className="text-quaternary text-center py-3">
          {translate('No resources found.')}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {data.projects.length > 1 ? (
            <FixedHeightTabs
              items={data.projects.map((project) => ({
                value: project.uuid,
                title: project.name,
                count: project.resources.length,
                content: <ResourceProjectGroup project={project} inTab />,
              }))}
              listClassName="mb-4"
            />
          ) : (
            <ResourceProjectGroup project={data.projects[0]} />
          )}
          {/* On a phone the footer wraps, so the note stays in the body. */}
          {showingNote && (
            <div className="text-center text-quaternary sm:hidden">
              {showingNote}
            </div>
          )}
        </div>
      )}
    </ModalDialog>
  );
};
