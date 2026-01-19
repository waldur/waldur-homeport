import { FunctionComponent } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { TableWithTabs } from '@waldur/table/TableWithTabs';

const tabs = [
  {
    key: 'verifications',
    title: translate('Verifications'),
    component: lazyComponent(() =>
      import('./OrganizationOnboardingVerificationsList').then((module) => ({
        default: module.OrganizationOnboardingVerificationsList,
      })),
    ),
  },
  {
    key: 'justifications',
    title: translate('Justifications'),
    component: lazyComponent(() =>
      import('./OrganizationOnboardingJustificationsList').then((module) => ({
        default: module.OrganizationOnboardingJustificationsList,
      })),
    ),
  },
];

export const OrganizationOnboardingTabs: FunctionComponent = () => {
  return (
    <TableWithTabs
      title={translate('Onboarding')}
      subtitle={translate(
        'Manage organization onboarding verifications, justifications, and configurations.',
      )}
      tabs={tabs}
      syncWithUrlKey="tab"
    />
  );
};
