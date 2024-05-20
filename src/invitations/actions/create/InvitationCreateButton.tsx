import { PlusCircle } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

import { useCreateInvitation } from '../hooks';
import { InvitationContext } from '../types';

export const InvitationCreateButton: FunctionComponent<
  Omit<InvitationContext, 'customer' | 'user'>
> = (context) => {
  const { callback, canInvite } = useCreateInvitation(context);

  return (
    <ActionButton
      action={callback}
      title={translate('Invite user')}
      iconNode={<PlusCircle />}
      variant="primary"
      disabled={!canInvite}
    />
  );
};
