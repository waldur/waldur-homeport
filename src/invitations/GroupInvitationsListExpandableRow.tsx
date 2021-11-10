import { FunctionComponent } from 'react';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';
import { UserPermissionRequestsList } from '@waldur/invitations/UserPermissionRequestsList';

export const GroupInvitationsListExpandableRow: FunctionComponent<{
  row;
}> = ({ row }) => (
  <div className="ibox-content">
    <p>
      <b>{translate('Invitation link')}: </b>
      <CopyToClipboardContainer
        value={`${location.origin}/invitation/${row.uuid}/`}
      />
    </p>
    <UserPermissionRequestsList groupInvitationUuid={row.uuid} />
  </div>
);
