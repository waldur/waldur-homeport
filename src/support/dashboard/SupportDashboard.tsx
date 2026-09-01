import { FC } from 'react';

import { BroadcastList } from '@/broadcasts/BroadcastList';
import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { IssuesList } from '@/issues/list/IssuesList';
import { PAGE_SIZE_COMPACT } from '@/table/constants';
import { useUser } from '@/workspace/hooks';

import { SupportStatistics } from './SupportStatistics';

export const SupportDashboard: FC = () => {
  const isSupportEnabled = ENV.plugins.WALDUR_SUPPORT?.ENABLED;
  const user = useUser();

  return (
    <>
      {isSupportEnabled ? <SupportStatistics /> : null}
      {isSupportEnabled ? (
        <IssuesList
          className="mb-5"
          title={translate('Open issues')}
          // `is_open` is the same definition the statistics card above counts
          // with. Filtering on the literal status "Open" left the card saying 1
          // while the table below it said none.
          filter={{ is_open: true }}
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
