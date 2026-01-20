import { FC, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { IssuesList } from '@waldur/issues/list/IssuesList';
import { PAGE_SIZE_FULL } from '@waldur/table/constants';
import { useUser } from '@waldur/workspace/hooks';

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
