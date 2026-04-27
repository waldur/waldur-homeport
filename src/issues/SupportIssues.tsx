import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Panel } from '@/core/Panel';
import { CustomerSupportRating } from '@/issues/CustomerSupportRating';
import { IssuesList } from '@/issues/list/IssuesList';
import { PAGE_SIZE_FULL } from '@/table/constants';
import {
  getUser,
  isStaffOrSupport as isStaffOrSupportSelector,
} from '@/workspace/selectors';

export const SupportIssues: FunctionComponent = () => {
  const isStaffOrSupport = useSelector(isStaffOrSupportSelector);
  const user = useSelector(getUser);
  return (
    <>
      {isStaffOrSupport && <CustomerSupportRating />}
      <Panel>
        <IssuesList scope={user} initialPageSize={PAGE_SIZE_FULL} />
      </Panel>
    </>
  );
};
