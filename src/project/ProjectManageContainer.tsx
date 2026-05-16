import { UIView } from '@uirouter/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { PageBarTab } from '@/navigation/types';
import { usePageTabsTransmitter } from '@/navigation/usePageTabsTransmitter';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';
import { getProject } from '@/workspace/selectors';

const ProjectGeneral = lazyComponent(() =>
  import('./manage/ProjectGeneral').then((module) => ({
    default: module.ProjectGeneral,
  })),
);
const ProjectMetadata = lazyComponent(() =>
  import('./manage/ProjectMetadata').then((module) => ({
    default: module.ProjectMetadata,
  })),
);
const ProjectMembershipRestrictions = lazyComponent(() =>
  import('./manage/ProjectMembershipRestrictions').then((module) => ({
    default: module.ProjectMembershipRestrictions,
  })),
);
const ProjectCredit = lazyComponent(() =>
  import('./manage/ProjectCredit').then((module) => ({
    default: module.ProjectCredit,
  })),
);
const ProjectOrderAutoApproval = lazyComponent(() =>
  import('./manage/ProjectOrderAutoApproval').then((module) => ({
    default: module.ProjectOrderAutoApproval,
  })),
);
const ProjectDelete = lazyComponent(() =>
  import('./manage/ProjectDelete').then((module) => ({
    default: module.ProjectDelete,
  })),
);
const ProjectEndDateChangeRequests = lazyComponent(() =>
  import('./manage/ProjectEndDateChangeRequests').then((module) => ({
    default: module.ProjectEndDateChangeRequests,
  })),
);

export const ProjectManageContainer = () => {
  const project = useSelector(getProject);
  const user = useUser();

  const canSeeOrderApproval = useMemo(() => {
    if (!project) return false;
    return (
      user.is_staff ||
      user.is_support ||
      hasPermission(user, {
        permission: PermissionEnum.APPROVE_ORDER,
        projectId: project.uuid,
        customerId: project.customer_uuid,
      })
    );
  }, [user, project]);

  const tabs = useMemo<PageBarTab[]>(
    () =>
      [
        {
          key: 'general',
          component: ProjectGeneral,
          title: translate('General'),
        },
        {
          key: 'metadata',
          component: ProjectMetadata,
          title: translate('Metadata'),
        },
        {
          key: 'membership-restrictions',
          component: ProjectMembershipRestrictions,
          title: translate('Membership restrictions'),
        },
        (project.project_credit || project.project_credit === 0) && {
          key: 'credit',
          component: ProjectCredit,
          title: translate('Credit management'),
        },
        canSeeOrderApproval && {
          key: 'order-approval',
          component: ProjectOrderAutoApproval,
          title: translate('Order approval'),
        },
        !project?.is_removed && {
          key: 'end-date-change-requests',
          component: ProjectEndDateChangeRequests,
          title: translate('End date change requests'),
        },
        !project?.is_removed && {
          key: 'remove',
          component: ProjectDelete,
          title: translate('Remove'),
        },
      ].filter(Boolean),
    [project, canSeeOrderApproval],
  );
  const { tabSpec } = usePageTabsTransmitter(tabs);

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component key={key} {...props} tabSpec={tabSpec} />
      )}
    />
  );
};
