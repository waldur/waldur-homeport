import { FunctionComponent } from 'react';

import { Panel } from '@/core/Panel';
import { CustomerSupportRating } from '@/issues/CustomerSupportRating';
import { IssuesList } from '@/issues/list/IssuesList';
import { PAGE_SIZE_FULL } from '@/table/constants';
import { useUser } from '@/workspace/hooks';

export const SupportIssues: FunctionComponent = () => {
  const user = useUser();
  const isStaffOrSupport = user?.is_staff || user?.is_support;
  return (
    <>
      {isStaffOrSupport && <CustomerSupportRating />}
      <Panel>
        <IssuesList scope={user} initialPageSize={PAGE_SIZE_FULL} />
      </Panel>
    </>
  );
};
