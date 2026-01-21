import { RocketLaunchIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceResourcesList } from 'waldur-js-client';

import { fetchResultCount } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { router } from '@waldur/router';

import { ResourceProjectGroup } from './ResourceProjectGroup';
import { ACTIVE_RESOURCE_STATES, groupResourcesByProject } from './utils';

const MAX_RESOURCES_DISPLAY = 5;

export const UserResourcesDialog: FC = () => {
  const dispatch = useDispatch();

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
    dispatch(closeModalDialog());
    router.stateService.go('all-resources');
  };

  return (
    <ModalDialog
      title={translate('Getting Started with Your Resources')}
      subtitle={translate(
        'Learn how to access and use your allocated resources',
      )}
      iconNode={<RocketLaunchIcon weight="bold" />}
      iconColor="info"
      footer={
        <div className="d-flex justify-content-end w-100">
          <SubmitButton
            submitting={false}
            type="button"
            onClick={handleViewAllResources}
          >
            {translate('View all resources')}
          </SubmitButton>
        </div>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-danger">
          {translate('Failed to load resources. Please try again.')}
        </div>
      ) : data?.projects?.length === 0 ? (
        <div className="text-muted text-center py-4">
          {translate('No resources found.')}
        </div>
      ) : (
        <div className="mt-4">
          {data?.projects?.map((project, index) => (
            <ResourceProjectGroup
              key={project.uuid}
              project={project}
              defaultOpen={index === 0}
            />
          ))}
          {data?.hasMore && (
            <div className="text-center text-muted mt-4 pt-2 border-top">
              {translate(
                'Showing {displayed} of {total} resources. Click "View all resources" to see the complete list.',
                {
                  displayed: MAX_RESOURCES_DISPLAY,
                  total: data.totalCount,
                },
              )}
            </div>
          )}
        </div>
      )}
    </ModalDialog>
  );
};
