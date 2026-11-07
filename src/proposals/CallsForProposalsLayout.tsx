import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { TabNav } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { MyCallWorkSummary } from '@/proposals/MyCallWorkSummary';
import { useUser } from '@/workspace/hooks';

const Subtitle: FunctionComponent = () => (
  <div className="text-quaternary mb-4">
    {translate('Find a call that fits your work and apply for resources.')}
  </div>
);

const TABS = [
  {
    state: 'calls-for-proposals-dashboard',
    title: () => translate('Open calls'),
  },
  {
    state: 'calls-for-proposals-all-calls',
    title: () => translate('All calls'),
  },
  {
    state: 'calls-for-proposals-all-available-offerings',
    title: () => translate('Available offerings'),
  },
];

/**
 * The page around the calls tabs: its title, for a signed-in user their own
 * work on calls as summary cards, then the tabs and the tab's table, as the
 * Reporting page is laid out.
 */
export const CallsForProposalsLayout: FunctionComponent = () => {
  const user = useUser();
  // Subscribes to transitions, so the tab highlight follows navigation.
  const { state } = useCurrentStateAndParams();
  return (
    <>
      <div className="mb-6 max-sm:mb-4">
        <h1 className="mb-1 text-2xl">{translate('Calls for proposals')}</h1>
        {user ? <MyCallWorkSummary fallback={<Subtitle />} /> : <Subtitle />}
        <TabNav
          items={TABS.map((tab) => ({
            key: tab.state,
            title: tab.title(),
            link: <Link state={tab.state} />,
            active: state.name === tab.state,
          }))}
        />
      </div>
      <UIView />
    </>
  );
};
