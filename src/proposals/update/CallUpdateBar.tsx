import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useContext, useEffect } from 'react';

import { translate } from '@waldur/i18n';
import { PageBarTab } from '@waldur/marketplace/common/PageBarTab';
import { PageBarContext } from '@waldur/marketplace/context';

import './CallPageBar.scss';
import { ProposalCall } from '../types';

interface CallUpdateBarProps {
  call: ProposalCall;
}

export const CallUpdateBar: FunctionComponent<CallUpdateBarProps> = ({
  call,
}) => {
  const { state } = useCurrentStateAndParams();
  const { tabs, addTabs, visibleSectionId } = useContext(PageBarContext);

  useEffect(() => {
    addTabs([
      {
        key: 'rounds',
        title: (
          <>
            {call.rounds.length === 0 ? (
              <i className="fa fa-warning text-danger fs-5" />
            ) : (
              <i className="fa fa-check text-success fs-5"></i>
            )}
            {translate('Rounds')}
          </>
        ),
      },
      {
        key: 'general',
        title: (
          <>
            {!call.description ? (
              <i className="fa fa-warning text-danger me-3" />
            ) : (
              <i className="fa fa-check text-success me-3" />
            )}
            <span>{translate('General')}</span>
          </>
        ),
      },
      {
        key: 'documents',
        title: translate('Documents'),
      },
      {
        key: 'reviewers',
        title: translate('Reviewers'),
      },
      {
        key: 'offerings',
        title: translate('Offerings'),
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
