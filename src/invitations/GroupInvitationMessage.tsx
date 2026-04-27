import { FunctionComponent } from 'react';
import { GroupInvitation } from 'waldur-js-client';

import { translate } from '@/i18n';

import { formatInvitation } from './formatInvitation';

export const GroupInvitationMessage: FunctionComponent<{
  invitation: GroupInvitation;
}> = ({ invitation }) => (
  <>
    <p className="mb-3">{formatInvitation(invitation, invitation.is_public)}</p>
    {invitation.custom_text && (
      <p className="text-muted mb-3">{invitation.custom_text}</p>
    )}
    <p className="mb-0">
      {invitation.is_public
        ? translate('Would you like to submit a join request?')
        : translate('Do you want to submit permission request?')}
    </p>
  </>
);
