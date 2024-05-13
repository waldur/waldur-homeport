import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';
import { PageBarTab } from '@waldur/marketplace/context';

const tabs: PageBarTab[] = [
  {
    key: 'details',
    title: translate('Details'),
    priority: 10,
  },
  {
    key: 'description',
    title: translate('Description'),
    priority: 20,
  },
  {
    key: 'documents',
    title: translate('Documents'),
    priority: 30,
  },
  {
    key: 'offerings',
    title: translate('Offerings'),
    priority: 40,
  },
];

export const PublicCallDetailsBar: FunctionComponent = () => (
  <PageBarTabs tabs={tabs} showFirstTab />
);
