import * as React from 'react';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { CustomerSupportRating } from '@waldur/issues/CustomerSupportRating';
import { IssuesList } from '@waldur/issues/list/IssuesList';
import { useTitle } from '@waldur/navigation/title';

export const SupportIssues = () => {
  useTitle(translate('Issues'));
  return (
    <>
      <CustomerSupportRating />
      <Panel>
        <IssuesList />
      </Panel>
    </>
  );
};
