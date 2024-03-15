import { translate } from '@waldur/i18n';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';
import { PageBarTab } from '@waldur/marketplace/context';

const tabs: PageBarTab[] = [
  {
    key: 'proposals',
    title: translate('Proposals'),
  },
  {
    key: 'submission',
    title: translate('Submission'),
  },
  {
    key: 'review',
    title: translate('Review'),
  },
  {
    key: 'reviewers',
    title: translate('Reviewers'),
  },
  {
    key: 'allocation',
    title: translate('Allocation'),
  },
];

export const RoundPageBar = () => <PageBarTabs tabs={tabs} />;
