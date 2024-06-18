import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { IssuesList } from '@waldur/issues/list/IssuesList';
import { getUser } from '@waldur/workspace/selectors';

export const UserIssuesTable: FC = () => {
  const user = useSelector(getUser);
  const filter = useMemo(() => ({ user: user?.url }), [user]);
  return (
    <IssuesList
      scope={user}
      filter={filter}
      hiddenColumns={['caller', 'time_in_progress']}
      title={translate('User issues')}
      initialPageSize={5}
    />
  );
};
