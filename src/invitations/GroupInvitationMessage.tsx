import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

import { formatInvitation } from './formatInvitation';
import { Invitation } from './types';

export const GroupInvitationMessage: FunctionComponent<{
  invitation: Invitation;
}> = ({ invitation }) => (
  <>
    <p>{formatInvitation(invitation)}</p>
    {translate('Do you want to submit permission request?')}
  </>
);
