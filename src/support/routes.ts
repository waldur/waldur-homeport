import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const SupportDetailsContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportDetailsContainer" */ './SupportDetailsContainer'
    ),
  'SupportDetailsContainer',
);

export const states: StateDeclaration[] = [
  {
    name: 'project.support-details',
    url: 'support/:resource_uuid/',
    component: SupportDetailsContainer,
    data: {
      sidebarKey: 'marketplace-project-resources',
    },
  },
];
