import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { CustomerSupportRating } from '@waldur/issues/CustomerSupportRating';
import { IssuesList } from '@waldur/issues/list/IssuesList';
import { useTitle } from '@waldur/navigation/title';
import { isStaffOrSupport as isStaffOrSupportSelector } from '@waldur/workspace/selectors';

import { useSupport } from './hooks';

export const SupportIssues: FunctionComponent = () => {
  useTitle(translate('Issues'));
  const isStaffOrSupport = useSelector(isStaffOrSupportSelector);
  useSupport();
  return (
    <>
      {isStaffOrSupport && <CustomerSupportRating />}
      <Panel>
        <IssuesList />
      </Panel>
    </>
  );
};
