import { useRouter } from '@uirouter/react';
import { useEffect } from 'react';
import { Customer, Project, User } from 'waldur-js-client';

export const hasCurrentCustomerPermission = (user: User, customer: Customer) =>
  user?.permissions?.find(
    ({ scope_uuid, scope_type }) =>
      scope_uuid === customer?.uuid && scope_type === 'customer',
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
