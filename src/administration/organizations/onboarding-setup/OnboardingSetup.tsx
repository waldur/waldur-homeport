import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { TableWithTabs } from '@waldur/table/TableWithTabs';

const tabs = [
  {
    key: 'customer',
    title: translate('Customer data'),
    component: lazyComponent(() =>
      import('./CustomerQuestionsTable').then((module) => ({
        default: module.CustomerQuestionsTable,
      })),
    ),
  },
  {
    key: 'intent',
    title: translate('Intent data'),
    component: lazyComponent(() =>
      import('./IntentQuestionsTable').then((module) => ({
        default: module.IntentQuestionsTable,
      })),
    ),
  },
];

export const OnboardingSetup: FC = () => {
  return (
    <TableWithTabs
      title={translate('Onboarding checklist configuration')}
      subtitle={translate(
        'Configure checklists for organization onboarding process. View and edit existing checklists or create new ones.',
      )}
      tabs={tabs}
    />
  );
};
