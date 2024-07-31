import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Panel } from '@waldur/core/Panel';
import { CustomerSupportRating } from '@waldur/issues/CustomerSupportRating';
import { IssuesList } from '@waldur/issues/list/IssuesList';
import {
  getUser,
  isStaffOrSupport as isStaffOrSupportSelector,
} from '@waldur/workspace/selectors';

export const SupportIssues: FunctionComponent = () => {
  const isStaffOrSupport = useSelector(isStaffOrSupportSelector);
  const user = useSelector(getUser);
  return (
    <>
      {isStaffOrSupport && <CustomerSupportRating />}
      <Panel>
        <IssuesList scope={user} />
      </Panel>
    </>
  );
};
