import { Project, User } from 'waldur-js-client';

import { canCreateMatrixRoom } from '@/matrix/canCreateMatrixRoom';
import { isMatrixChatEnabled } from '@/matrix/utils';
import { PermissionEnum } from '@/permissions/enums';
import {
  hasConsumerPermission,
  hasPermission,
} from '@/permissions/hasPermission';
import { type RootState } from '@/store/reducers';
import { getProject, getUser } from '@/workspace/selectors';

import { canEditProject } from './utils';

type SettingsUser = Pick<User, 'is_staff' | 'is_support' | 'permissions'>;
type SettingsProject = Pick<Project, 'uuid' | 'customer_uuid' | 'is_removed'>;

export interface ProjectSettingsAccess {
  /** General, membership restrictions, credit, and end-date review. */
  updateProject: boolean;
  /** Checklist answers on the metadata tab. */
  updateMetadata: boolean;
  /** Read the tabs updateProject edits, with no controls. Support does. */
  readOnlyView: boolean;
  /** Order auto-approval. Support may open the tab. */
  orderApproval: boolean;
  /** Remove. */
  deleteProject: boolean;
  /** Create the project chat room. */
  chat: boolean;
}

const noAccess: ProjectSettingsAccess = {
  updateProject: false,
  updateMetadata: false,
  readOnlyView: false,
  orderApproval: false,
  deleteProject: false,
  chat: false,
};

const held = (
  user: SettingsUser,
  permission: string,
  project: SettingsProject,
  scope: 'project' | 'customer',
) =>
  Boolean(
    hasPermission(user, {
      permission,
      ...(scope === 'project'
        ? { projectId: project.uuid, customerId: project.customer_uuid }
        : { customerId: project.customer_uuid }),
    }),
  );

/**
 * Which settings tabs this user may use. A custom role can hold any one of
 * these without the others. POSIX details and an existing chat room are not
 * included: they do not grant entry to the page.
 */
export const getProjectSettingsAccess = (
  user: SettingsUser | null | undefined,
  project: SettingsProject | null | undefined,
): ProjectSettingsAccess => {
  if (!user || !project?.uuid) {
    return noAccess;
  }
  return {
    updateProject: Boolean(
      canEditProject(user, {
        customer: { uuid: project.customer_uuid },
        project,
      }),
    ),
    updateMetadata: held(
      user,
      PermissionEnum.UPDATE_PROJECT_METADATA,
      project,
      'project',
    ),
    readOnlyView: Boolean(user.is_support),
    orderApproval:
      Boolean(user.is_staff) ||
      Boolean(user.is_support) ||
      hasConsumerPermission(user, {
        permission: PermissionEnum.APPROVE_ORDER,
        projectId: project.uuid,
        customerId: project.customer_uuid,
      }),
    // The API checks this on the organization, so a grant on the project alone
    // would open a Remove tab whose button is refused.
    deleteProject:
      !project.is_removed &&
      held(user, PermissionEnum.DELETE_PROJECT, project, 'customer'),
    chat: isMatrixChatEnabled() && canCreateMatrixRoom(user, project),
  };
};

/** True when at least one settings tab is for this user. */
export const canOpenProjectSettings = (
  user: SettingsUser | null | undefined,
  project: SettingsProject | null | undefined,
): boolean =>
  Object.values(getProjectSettingsAccess(user, project)).some(Boolean);

/** Route predicate for project settings. */
export const canManageProject = (state: RootState): boolean =>
  canOpenProjectSettings(getUser(state), getProject(state));
