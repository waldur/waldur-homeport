import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';
import { UserPermissionRequestsList } from '@waldur/invitations/UserPermissionRequestsList';

export const GroupInvitationsListExpandableRow: FunctionComponent<{
  row;
}> = ({ row }) => (
  <Card.Body>
    <p>
      <b>{translate('Invitation link')}: </b>
      <CopyToClipboardContainer
        value={`${location.origin}/user-group-invitation/${row.uuid}/`}
      />
    </p>
    <UserPermissionRequestsList groupInvitationUuid={row.uuid} />
  </Card.Body>
);
