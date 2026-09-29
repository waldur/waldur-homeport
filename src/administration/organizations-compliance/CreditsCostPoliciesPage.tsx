import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';

const TABS = [
  {
    key: 'credits',
    title: translate('Credits'),
    component: lazyComponent(() =>
      import('../organizations/OrganizationCreditsList').then((module) => ({
        default: module.OrganizationCreditsList,
      })),
    ),
  },
  {
    key: 'cost-policies',
    title: translate('Cost policies'),
    component: lazyComponent(() =>
      import('../organizations/OrganizationCostPoliciesList').then(
        (module) => ({
          default: module.OrganizationCostPoliciesList,
        }),
      ),
    ),
  },
];

export const CreditsCostPoliciesPage = () => (
  <TableWithTabs
    title={translate('Credits & cost policies')}
    subtitle={translate(
      'Credit allocated to organizations and the policies applied when their estimated cost reaches a limit.',
    )}
    tabs={TABS}
    syncWithUrlKey="tab"
  />
);
