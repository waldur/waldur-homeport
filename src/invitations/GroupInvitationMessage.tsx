import { FunctionComponent } from 'react';
import { GroupInvitation } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

import { formatInvitation } from './formatInvitation';

export const GroupInvitationMessage: FunctionComponent<{
  invitation: GroupInvitation;
}> = ({ invitation }) => (
  <>
    <p>{formatInvitation(invitation)}</p>
    {translate('Do you want to submit permission request?')}
  </>
);
