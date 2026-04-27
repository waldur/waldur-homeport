import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';

const tabs = [
  {
    key: 'identities',
    title: translate('Agent identities'),
    component: lazyComponent(() =>
      import('./AgentIdentitiesList').then((module) => ({
        default: module.AgentIdentitiesList,
      })),
    ),
  },
  {
    key: 'services',
    title: translate('Agent services'),
    component: lazyComponent(() =>
      import('./AgentServicesList').then((module) => ({
        default: module.AgentServicesList,
      })),
    ),
  },
  {
    key: 'processors',
    title: translate('Agent processors'),
    component: lazyComponent(() =>
      import('./AgentProcessorsList').then((module) => ({
        default: module.AgentProcessorsList,
      })),
    ),
  },
];

export const SiteAgentManagement = () => {
  return (
    <TableWithTabs
      title={translate('Site agents')}
      subtitle={translate(
        'Manage site agent identities, services, and processors for event-based integrations.',
      )}
      tabs={tabs}
    />
  );
};
