import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const OrganizationProjectUpdateRequestsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OrganizationProjectUpdateRequestsList" */ './OrganizationProjectUpdateRequestsList'
    ),
  'OrganizationProjectUpdateRequestsList',
);

const ProjectUpdateRequestsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ProjectUpdateRequestsList" */ './ProjectUpdateRequestsList'
    ),
  'ProjectUpdateRequestsList',
);

export const states: StateDeclaration[] = [
  {
    name: 'marketplace-organization-project-update-requests',
    url: 'marketplace-project-update-requests/',
    component: OrganizationProjectUpdateRequestsList,
    parent: 'organization',
  },
  {
    name: 'marketplace-project-update-requests',
    url: 'marketplace-project-update-requests/',
    component: ProjectUpdateRequestsList,
    parent: 'project',
  },
];
