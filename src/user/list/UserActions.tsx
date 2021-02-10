import { FunctionComponent } from 'react';

import { ActionList } from '@waldur/dashboard/ActionList';
import { getIssueAction } from '@waldur/dashboard/ReportIssueAction';
import { getReportSecurityIncidentAction } from '@waldur/dashboard/ReportSecurityIncidentAction';
import { User } from '@waldur/workspace/types';

interface UserActionsProps {
  user: User;
}

export const UserActions: FunctionComponent<UserActionsProps> = ({ user }) => (
  <ActionList
    actions={[
      getIssueAction({
        issue: { user },
        hideProjectAndResourceFields: true,
      }),
      getReportSecurityIncidentAction(false, false),
    ].filter((action) => action !== undefined)}
  />
);
