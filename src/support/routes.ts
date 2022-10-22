import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';

const SupportDetailsContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportDetailsContainer" */ './SupportDetailsContainer'
    ),
  'SupportDetailsContainer',
);
const SupportEventsContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportEventsContainer" */ './SupportEventsContainer'
    ),
  'SupportEventsContainer',
);

export const states: StateDeclaration[] = [
  {
    name: 'project.support-details',
    url: 'support/:resource_uuid/',
    component: SupportDetailsContainer,
  },

  {
    name: 'support.events',
    url: 'events/',
    component: SupportEventsContainer,
    data: {
      breadcrumb: () => translate('Audit log'),
    },
  },
];
