import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { UserPermissionRequestsList } from '@waldur/invitations/UserPermissionRequestsList';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import { getGroupInvitationLink } from './utils';

export const GroupInvitationsListExpandableRow: FunctionComponent<{
  row;
}> = ({ row }) => (
  <ExpandableContainer>
    <Field
      label={translate('Invitation link')}
      value={getGroupInvitationLink(row)}
      hasCopy
      isStuck
      labelClass="min-w-150px fw-bolder"
      space={5}
    />

    <UserPermissionRequestsList groupInvitationUuid={row.uuid} />
  </ExpandableContainer>
);
