import { FunctionComponent } from 'react';

import { ActionList } from '@waldur/dashboard/ActionList';
import { getIssueAction } from '@waldur/dashboard/ReportIssueAction';
import { getReportSecurityIncidentAction } from '@waldur/dashboard/ReportSecurityIncidentAction';
import { getSupportPortalAction } from '@waldur/dashboard/SupportPortalAction';

import { getProjectAction } from './CreateProjectAction';
import { getInviteAction } from './InviteUserAction';
import { CustomerActionsProps } from './types';

export const CustomerActions: FunctionComponent<CustomerActionsProps> = (
  props,
) => (
  <ActionList
    actions={[
      getProjectAction(props),
      getInviteAction(props),
      getIssueAction({
        issue: { customer: props.customer },
        state: 'organization.issues',
      }),
      getSupportPortalAction(),
      getReportSecurityIncidentAction(),
    ].filter((action) => action !== undefined)}
  />
);
