import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Project } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { InvitationsFeatures, ProjectFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';

import { userHasProjectPermission } from '../utils';

export const useTeamTableTabs = (project: Project) => {
  const hasProjectPermission = useSelector(
    userHasProjectPermission(PermissionEnum.REVIEW_PROJECT_MEMBERSHIP),
  );
  if (!project) {
    return [];
  }
  return useMemo(
    () =>
      [
        project.kind !== 'course' && {
          key: 'users',
          title: translate('Active'),
          state: 'project-users',
        },
        project.kind !== 'course' && {
          key: 'project-invitations',
          title: translate('Invitations'),
          state: 'project-invitations',
        },
        isFeatureVisible(ProjectFeatures.show_permission_reviews) &&
          hasProjectPermission && {
            key: 'reviews',
            title: translate('Permission reviews'),
            state: 'project-permissions-reviews',
          },
        isFeatureVisible(InvitationsFeatures.show_service_accounts) && {
          key: 'project-service-accounts',
          title: translate('Service accounts'),
          state: 'project-service-accounts',
        },
        isFeatureVisible(InvitationsFeatures.show_course_accounts) &&
          project.kind === 'course' && {
            key: 'project-course-accounts',
            title: translate('Course accounts'),
            state: 'project-course-accounts',
          },
      ].filter(Boolean),
    [project, hasProjectPermission],
  );
};
