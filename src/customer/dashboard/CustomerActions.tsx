import * as React from 'react';

import { ActionList } from '@waldur/dashboard/ActionList';
import { getIssueAction } from '@waldur/dashboard/ReportIssueAction';
import { getSupportPortalAction } from '@waldur/dashboard/SupportPortalAction';

import { getProjectAction } from './CreateProjectAction';
import { getInviteAction } from './InviteUserAction';
import { CustomerActionsProps } from './types';

export const CustomerActions = (props: CustomerActionsProps) => (
  <ActionList actions={[
    getProjectAction(props),
    getInviteAction(props),
    getIssueAction({issue: {customer: props.customer}, state: 'organization.issues'}),
    getSupportPortalAction(),
  ].filter(action => action !== undefined)}/>
);
