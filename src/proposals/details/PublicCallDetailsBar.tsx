import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';
import { PageBarTab } from '@waldur/marketplace/context';

const tabs: PageBarTab[] = [
  {
    key: 'details',
    title: translate('Details'),
  },
  {
    key: 'description',
    title: translate('Description'),
  },
  {
    key: 'documents',
    title: translate('Documents'),
  },
  {
    key: 'offerings',
    title: translate('Offerings'),
  },
];

export const PublicCallDetailsBar: FunctionComponent = () => (
  <PageBarTabs tabs={tabs} />
);
