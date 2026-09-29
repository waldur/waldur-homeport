import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';

const TABS = [
  {
    key: 'organization-groups',
    title: translate('Organization groups'),
    component: lazyComponent(() =>
      import('../organizations/OrganizationGroupsList').then((module) => ({
        default: module.OrganizationGroupsList,
      })),
    ),
  },
  {
    key: 'affiliations',
    title: translate('Affiliations'),
    component: lazyComponent(() =>
      import('../affiliated-organizations/AffiliatedOrganizationsList').then(
        (module) => ({
          default: module.AffiliatedOrganizationsList,
        }),
      ),
    ),
  },
  {
    key: 'science-domains',
    title: translate('Science domains'),
    component: lazyComponent(() =>
      import('../science-domains/ScienceDomainsList').then((module) => ({
        default: module.ScienceDomainsList,
      })),
    ),
  },
];

export const ClassifiersPage = () => (
  <TableWithTabs
    title={translate('Classifiers')}
    subtitle={translate(
      'Groups, affiliations and science domains used to classify organizations and projects.',
    )}
    tabs={TABS}
    syncWithUrlKey="tab"
  />
);
