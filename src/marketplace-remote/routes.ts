import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const ProjectUpdateRequestsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ProjectUpdateRequestsList" */ './ProjectUpdateRequestsList'
    ),
  'ProjectUpdateRequestsList',
);

export const states: StateDeclaration[] = [
  {
    name: 'marketplace-project-update-requests',
    url: 'marketplace-project-update-requests/',
    component: ProjectUpdateRequestsList,
    parent: 'organization',
  },
];
