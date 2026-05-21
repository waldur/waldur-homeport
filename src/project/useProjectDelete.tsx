import { useRouter } from '@uirouter/react';
import { useDispatch } from 'react-redux';
import { projectsDestroy } from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { getCustomer as getCustomerApi } from '@/customer/utils';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useNotify } from '@/store/notify';
import { setCurrentCustomer, setCurrentProject } from '@/workspace/actions';
import { useUser, useProject } from '@/workspace/hooks';

export const useProjectDelete = ({
  project,
  refetch,
}: {
  project: Project;
  refetch?: () => void;
}) => {
  const { confirm } = useModal();

  const router = useRouter();
  const dispatch = useDispatch();

  const { showErrorResponse, showSuccess } = useNotify();

  const user = useUser();
  const currentProject = useProject();

  const isCurrentProject = project.uuid === currentProject?.uuid;
  const canDelete =
    !project.is_removed &&
    (hasPermission(user, {
      permission: PermissionEnum.DELETE_PROJECT,
      customerId: project.customer_uuid,
    }) ||
      hasPermission(user, {
        permission: PermissionEnum.DELETE_PROJECT,
        projectId: project.uuid,
      }));

  const callback = async () => {
    try {
      await confirm(
        translate('Project removal'),
        translate(
          'Are you sure you would like to delete project {projectName}?',
          {
            projectName: <strong>{project.name}</strong>,
          },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await projectsDestroy({ path: { uuid: project.uuid } });
      if (refetch) {
        await refetch();
      }
      const newCustomer = await getCustomerApi(project.customer_uuid);
      dispatch(setCurrentCustomer(newCustomer));
      if (isCurrentProject) {
        router.stateService.go('organization.projects', {
          uuid: project.customer_uuid,
        });
        dispatch(setCurrentProject(undefined));
      }
      showSuccess(
        translate(
          'Project {project} from {organization} was successfully removed',
          {
            project: project.name,
            organization: project.customer_name,
          },
        ),
      );
    } catch (e) {
      showErrorResponse(e, translate('An error occurred on project removal.'));
    }
  };
  return { canDelete, callback };
};
