import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';
import { PageBarTab } from '@waldur/marketplace/context';

import { ProposalCall } from '../types';

interface CallUpdateBarProps {
  call: ProposalCall;
}

export const CallUpdateBar: FunctionComponent<CallUpdateBarProps> = ({
  call,
}) => {
  const tabs = useMemo<PageBarTab[]>(
    () => [
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
    ],
    [call],
  );

  return <PageBarTabs tabs={tabs} />;
};
