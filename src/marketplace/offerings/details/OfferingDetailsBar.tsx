import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';

import useScrollTracker from '@waldur/core/useScrollTracker';
import { translate } from '@waldur/i18n';
import { PageBarTab } from '@waldur/marketplace/common/PageBarTab';
import './OfferingPageBar.scss';
import { ConnectionStatusIndicator } from '@waldur/marketplace/offerings/details/ConnectionStatusIndicator';

export const OfferingDetailsBar: FunctionComponent<any> = (props) => {
  const { state } = useCurrentStateAndParams();

  const tabs = useMemo(() => {
    return [
      { key: 'orders', title: translate('Orders') },
      { key: 'resources', title: translate('Resources') },
      { key: 'plans', title: translate('Plans') },
      { key: 'users', title: translate('Users') },
      { key: 'events', title: translate('Events') },
    ];
  }, []);

  const activeSectionId = useScrollTracker({
    sectionIds: tabs.map((tab) => tab.key),
    trackSide: 'bottom',
    offset: 100,
  });

  return (
    <div className="offering-page-bar bg-body shadow-sm">
      <div className="container-xxl">
        <div className="d-flex pt-2 pb-1">
          <div className="d-flex align-items-center w-100">
            {tabs.map((tab) => (
              <PageBarTab
                key={tab.key}
                title={tab.title}
                name={tab.key}
                state={state.name}
                params={{ '#': tab.key }}
                active={activeSectionId === tab.key}
              />
            ))}
            {props.integrationStatus.length > 0 && (
              <div className="ms-auto ">
                <ConnectionStatusIndicator status={props.integrationStatus} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
