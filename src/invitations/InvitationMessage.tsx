import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { User } from '@waldur/workspace/types';

import { formatInvitation } from './formatInvitation';
import { Invitation } from './types';

export const InvitationMessage: FunctionComponent<{
  invitation: Invitation;
  user: User;
}> = ({ invitation, user }) => (
  <>
    <p>{formatInvitation(invitation)}</p>
    {user.email.toLowerCase() !== invitation.email.toLowerCase() ? (
      <>
        <p>
          {translate('Your current email is:')} <strong>{user.email}</strong>
        </p>
        <p>
          {translate('Invitation email is:')}{' '}
          <strong>{invitation.email}</strong>
        </p>
        <p>
          {translate(
            'Would you like to update your current email with the one from the invitation?',
          )}
        </p>
      </>
    ) : null}
  </>
);
