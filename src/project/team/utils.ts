import { useRouter } from '@uirouter/react';
import { useEffect } from 'react';
import { createSelector } from 'reselect';
import { Project } from 'waldur-js-client';

import { getCustomer, getUser } from '@waldur/workspace/selectors';

export const hasCurrentCustomerPermission = createSelector(
  getUser,
  getCustomer,
  (user, customer) =>
    user?.permissions?.find(
      ({ scope_uuid, scope_type }) =>
        scope_uuid === customer?.uuid && scope_type === 'customer',
    ),
);

export const useRedirectCourseProjects = (project: Project) => {
  // Check if project is course kind, then redirect
  const router = useRouter();
  useEffect(() => {
    const redirect = ['project-users', 'project-invitations'].includes(
      router.globals.$current.name,
    );
    if (redirect && project.kind === 'course') {
      router.stateService.go('project-course-accounts');
    }
  }, []);
};
