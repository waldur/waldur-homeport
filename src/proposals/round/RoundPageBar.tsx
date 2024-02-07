import { useCurrentStateAndParams } from '@uirouter/react';
import { useContext, useEffect } from 'react';

import { translate } from '@waldur/i18n';
import { PageBarTab } from '@waldur/marketplace/common/PageBarTab';
import { PageBarContext } from '@waldur/marketplace/context';

import '@waldur/proposals/update/CallPageBar.scss';

export const RoundPageBar = () => {
  const { state } = useCurrentStateAndParams();
  const { tabs, addTabs, visibleSectionId } = useContext(PageBarContext);

  useEffect(() => {
    addTabs([
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
    ]);
  }, []);

  return (
    <div className="call-page-bar bg-body shadow-sm">
      <div className="container-xxl">
        <div className="d-flex scroll-x pt-2 pb-1">
          <div className="d-flex align-items-center w-100">
            {tabs.map((tab) => (
              <PageBarTab
                key={tab.key}
                title={tab.title}
                name={tab.key}
                state={state.name}
                params={{ '#': tab.key }}
                active={visibleSectionId === tab.key}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
