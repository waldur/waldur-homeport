import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { TableWithTabs } from '@waldur/table/TableWithTabs';

const tabs = [
  {
    key: 'organizations',
    title: translate('Organizations'),
    component: lazyComponent(() =>
      import('./OrganizationsServiceAccountsList').then((module) => ({
        default: module.OrganizationsServiceAccountsList,
      })),
    ),
  },
  {
    key: 'projects',
    title: translate('Projects'),
    component: lazyComponent(() =>
      import('./ProjectsServiceAccountsList').then((module) => ({
        default: module.ProjectsServiceAccountsList,
      })),
    ),
  },
];

export const ServiceAccountsTable = () => {
  return (
    <TableWithTabs
      title={translate('Service accounts')}
      subtitle={translate(
        'API accounts for automation at organization and project level.',
      )}
      tabs={tabs}
    />
  );
};
