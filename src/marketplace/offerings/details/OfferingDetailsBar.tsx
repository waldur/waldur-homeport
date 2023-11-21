import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';

import useScrollTracker from '@waldur/core/useScrollTracker';
import { translate } from '@waldur/i18n';
import { PageBarTab } from '@waldur/marketplace/common/PageBarTab';

import './OfferingPageBar.scss';

const Tab = ({ state, tab, active }) => (
  <PageBarTab
    title={tab.title}
    name={tab.key}
    state={state}
    params={{ '#': tab.key }}
    className={'btn' + (active ? ' text-primary' : ' text-white')}
  />
);

export const OfferingDetailsBar: FunctionComponent = () => {
  const { state } = useCurrentStateAndParams();

  const tabs = useMemo(() => {
    return [
      { key: 'order-items', title: translate('Order items') },
      { key: 'resources', title: translate('Resources') },
      { key: 'users', title: translate('Users') },
    ];
  }, []);

  const activeSectionId = useScrollTracker({
    sectionIds: tabs.map((tab) => tab.key),
    trackSide: 'bottom',
    offset: 100,
  });

  return (
    <div className="offering-page-bar bg-light-dark shadow-sm">
      <div className="container-xxl">
        <div className="d-flex scroll-x pt-2 pb-1">
          <div className="d-flex align-items-center w-100">
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                tab={tab}
                state={state.name}
                active={activeSectionId === tab.key}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
