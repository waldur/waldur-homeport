import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { Project } from 'waldur-js-client';

import { translate } from '@/i18n/translate';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

export const ProjectEditAction = ({ project }: { project: Project }) => {
  const router = useRouter();
  const user = useUser();

  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROJECT,
      projectId: project.uuid,
    }) &&
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROJECT,
      customerId: project.customer_uuid,
    })
  ) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Edit')}
      action={() =>
        router.stateService.go('project-manage', { uuid: project.uuid })
      }
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
