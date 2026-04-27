import { FC, useMemo } from 'react';

import { translate } from '@/i18n';
import { IssuesList } from '@/issues/list/IssuesList';
import { PAGE_SIZE_FULL } from '@/table/constants';
import { useUser } from '@/workspace/hooks';

export const UserIssuesTable: FC = () => {
  const user = useUser();
  const filter = useMemo(() => ({ user: user?.url }), [user]);
  return (
    <IssuesList
      scope={user}
      filter={filter}
      hiddenColumns={['caller', 'time_in_progress', 'customer', 'project']}
      title={translate('Support requests')}
      initialPageSize={PAGE_SIZE_FULL}
      standalone={false}
    />
  );
};
