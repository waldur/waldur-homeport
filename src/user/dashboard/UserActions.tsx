import { FunctionComponent } from 'react';

import { ActionList } from '@waldur/dashboard/ActionList';
import { getIssueAction } from '@waldur/dashboard/ReportIssueAction';
import { getReportSecurityIncidentAction } from '@waldur/dashboard/ReportSecurityIncidentAction';
import { getFlowCreateAction } from '@waldur/marketplace-flows/getFlowCreateAction';
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
      getFlowCreateAction(),
    ].filter((action) => action !== undefined)}
  />
);
