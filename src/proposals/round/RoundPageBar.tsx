import { translate } from '@waldur/i18n';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';
import { PageBarTab } from '@waldur/marketplace/context';

const tabs: PageBarTab[] = [
  {
    key: 'proposals',
    title: translate('Proposals'),
  },
  {
    key: 'reviewers',
    title: translate('Reviewers'),
  },
  {
    key: 'submission',
    title: translate('Submission strategy'),
  },
  {
    key: 'review',
    title: translate('Review strategy'),
  },
  {
    key: 'allocation',
    title: translate('Allocation strategy'),
  },
];

export const RoundPageBar = () => <PageBarTabs tabs={tabs} />;
