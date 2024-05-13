import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';
import { PageBarTab } from '@waldur/marketplace/context';

const tabs: PageBarTab[] = [
  {
    key: 'description',
    title: translate('Description'),
    priority: 10,
  },
  {
    key: 'documents',
    title: translate('Documents'),
    priority: 20,
  },
  {
    key: 'offerings',
    title: translate('Offerings'),
    priority: 30,
  },
];

export const PublicCallDetailsBar: FunctionComponent = () => (
  <PageBarTabs tabs={tabs} showFirstTab />
);
