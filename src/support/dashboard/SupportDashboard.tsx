import { FC } from 'react';
import { useSelector } from 'react-redux';

import { BroadcastList } from '@/broadcasts/BroadcastList';
import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { IssuesList } from '@/issues/list/IssuesList';
import { PAGE_SIZE_COMPACT } from '@/table/constants';
import { getUser } from '@/workspace/selectors';

import { SupportStatistics } from './SupportStatistics';

export const SupportDashboard: FC = () => {
  const isSupportEnabled = ENV.plugins.WALDUR_SUPPORT?.ENABLED;
  const user = useSelector(getUser);

  return (
    <>
      {isSupportEnabled ? <SupportStatistics /> : null}
      {isSupportEnabled ? (
        <IssuesList
          className="mb-5"
          title={translate('Open issues')}
          filter={{ status: 'Open' }}
          initialPageSize={PAGE_SIZE_COMPACT}
          showPageSizeSelector={false}
          scope={user}
          standalone={false}
        />
      ) : null}

      <BroadcastList standalone={false} />
    </>
  );
};
