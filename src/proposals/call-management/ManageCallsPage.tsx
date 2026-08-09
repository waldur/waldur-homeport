import { FunctionComponent } from 'react';

import { CallManagementPage } from './CallManagementPage';

/**
 * The calls this user can manage, across every organisation.
 *
 * The protected calls endpoint is already scoped by role, so a call manager
 * gets their own calls and staff get all of them. Answering "which calls do I
 * run" with a list of organisations made the user do the join themselves.
 */
export const ManageCallsPage: FunctionComponent = () => (
  <CallManagementPage scopeToCustomer={false} />
);
