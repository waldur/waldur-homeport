import { FunctionComponent } from 'react';

import { UserPermissionRequestsList } from '@waldur/invitations/UserPermissionRequestsList';

export const GroupInvitationsListExpandableRow: FunctionComponent<{
  row;
}> = ({ row }) => (
  <div className="ibox-content">
    <UserPermissionRequestsList groupInvitationUuid={row.uuid} />
  </div>
);
