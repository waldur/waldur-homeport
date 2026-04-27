import { FunctionComponent } from 'react';
import { VisibleInvitationDetails } from 'waldur-js-client';
import { User } from 'waldur-js-client';

import { translate } from '@/i18n';

import { formatInvitation } from './formatInvitation';

export const InvitationMessage: FunctionComponent<{
  invitation: VisibleInvitationDetails;
  user: User;
}> = ({ invitation, user }) => (
  <>
    <p>{formatInvitation(invitation)}</p>
    {user.email.toLowerCase() !== invitation.email.toLowerCase() ? (
      <>
        <b>{translate('Attention!')}</b>
        <p>
          {translate('Your current email is:')} <strong>{user.email}</strong>
        </p>
        <p>
          {translate('Invitation email is:')}{' '}
          <strong>{invitation.email}</strong>
        </p>
      </>
    ) : null}
  </>
);
