import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const OrganizationProjectUpdateRequestListContainer = lazyComponent(
  () => import('./OrganizationProjectUpdateRequestListContainer'),
  'OrganizationProjectUpdateRequestListContainer',
);

const ProjectUpdateRequestListContainer = lazyComponent(
  () => import('./ProjectUpdateRequestListContainer'),
  'ProjectUpdateRequestListContainer',
);

export const states: StateDeclaration[] = [
  {
    name: 'marketplace-organization-project-update-requests',
    url: 'marketplace-project-update-requests/',
    component: OrganizationProjectUpdateRequestListContainer,
    parent: 'organization',
  },
  {
    name: 'marketplace-project-update-requests',
    url: 'marketplace-project-update-requests/',
    component: ProjectUpdateRequestListContainer,
    parent: 'project',
  },
];
