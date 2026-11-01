import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { canCreateMatrixRoom } from '@/matrix/canCreateMatrixRoom';
import {
  hasActiveMatrixRoom,
  useProjectMatrixRooms,
} from '@/matrix/chat/useProjectMatrixRooms';
import { isMatrixChatEnabled } from '@/matrix/utils';
import { PageBarTab } from '@/navigation/types';
import { usePageTabsTransmitter } from '@/navigation/usePageTabsTransmitter';
import { useUser, useProject } from '@/workspace/hooks';
import { isOwnerOrStaff } from '@/workspace/selectors';

import {
  isProjectPosixGroupsVisible,
  useProjectPosixGroups,
} from './manage/useProjectPosixGroups';
import { getProjectSettingsAccess } from './settingsAccess';

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
const ProjectMatrixChat = lazyComponent(() =>
  import('./manage/ProjectMatrixChat').then((module) => ({
    default: module.ProjectMatrixChat,
  })),
);
const ProjectEndDateChangeRequests = lazyComponent(() =>
  import('./manage/ProjectEndDateChangeRequests').then((module) => ({
    default: module.ProjectEndDateChangeRequests,
  })),
);
const ProjectPosixGroups = lazyComponent(() =>
  import('./manage/ProjectPosixGroups').then((module) => ({
    default: module.ProjectPosixGroups,
  })),
);

export const ProjectManageContainer = () => {
  const project = useProject();
  const user = useUser();
  const isOwnerOrStaffUser = useSelector(isOwnerOrStaff);
  const { data: rooms } = useProjectMatrixRooms(project?.uuid);
  const hasActiveRoom = hasActiveMatrixRoom(rooms);
  // Owners and staff manage whatever room exists, even on a removed project,
  // where its termination export lives.
  const canManageRoom =
    canCreateMatrixRoom(user, project) ||
    (isOwnerOrStaffUser && Boolean(rooms?.length));
  const {
    data: posixGroups,
    isLoading: posixGroupsLoading,
    isError: posixGroupsFailed,
  } = useProjectPosixGroups(project?.uuid);
  // Shown when the project has groups. While the rollup loads or after it
  // failed, it stays only if it is the open tab, so its loading and error
  // states show there without the tab flashing on every other project page.
  const { params } = useCurrentStateAndParams();
  const posixTabOpen = params?.tab === 'posix-identities';
  // Never where POSIX identities are off, whatever the project holds.
  const hasPosixGroups =
    isProjectPosixGroupsVisible() &&
    (Boolean(posixGroups?.length) ||
      (posixTabOpen && (posixGroupsLoading || posixGroupsFailed)));

  const access = useMemo(
    () => getProjectSettingsAccess(user, project),
    [user, project],
  );
  // Each of these tabs hides the controls of whoever cannot use them.
  const canReadProject = access.updateProject || access.readOnlyView;

  const tabs = useMemo<PageBarTab[]>(
    () =>
      [
        canReadProject && {
          key: 'general',
          component: ProjectGeneral,
          title: translate('General'),
        },
        (canReadProject || access.updateMetadata) && {
          key: 'metadata',
          component: ProjectMetadata,
          title: translate('Metadata'),
        },
        // Saving also needs PROJECT.CREATE on the organization, which the tab
        // checks. A project manager reads the rules their invitations must meet.
        canReadProject && {
          key: 'membership-restrictions',
          component: ProjectMembershipRestrictions,
          title: translate('Membership restrictions'),
        },
        // Credit has no permission of its own. Whoever can update the project
        // reads it here; only owners and staff can edit it.
        canReadProject &&
          (project.project_credit || project.project_credit === 0) && {
            key: 'credit',
            component: ProjectCredit,
            title: translate('Credit management'),
          },
        access.orderApproval && {
          key: 'order-approval',
          component: ProjectOrderAutoApproval,
          title: translate('Order approval'),
        },
        canReadProject &&
          !project?.is_removed && {
            key: 'end-date-change-requests',
            component: ProjectEndDateChangeRequests,
            title: translate('End date change requests'),
          },
        // Read-only. It does not grant entry; it shows once the page is open.
        hasPosixGroups && {
          key: 'posix-identities',
          component: ProjectPosixGroups,
          title: translate('POSIX identities'),
        },
        // Owners and staff need the tab before a room exists: its empty state
        // is where they create one. An existing room stays visible for anyone
        // already on the page.
        isMatrixChatEnabled() &&
          (canManageRoom || hasActiveRoom) && {
            key: 'chat',
            component: ProjectMatrixChat,
            title: translate('Chat'),
          },
        access.deleteProject && {
          key: 'remove',
          component: ProjectDelete,
          title: translate('Remove'),
        },
      ].filter(Boolean),
    [
      project,
      access,
      canReadProject,
      canManageRoom,
      hasActiveRoom,
      hasPosixGroups,
    ],
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
